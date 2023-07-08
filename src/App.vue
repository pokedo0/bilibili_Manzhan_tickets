<template>
  <div>
    <div>只可以抢默认购票人</div>
    <div>票信息ID（url上有）<input type="text" v-model="piaoId"/></div>
    <div>第 <input type="text" v-model="tian"/> 天</div>
    <div>钱数<input type="text" v-model="qian"/>（分）</div>
    <div><input type="text" v-model="time"/>秒抢一次</div>
    <div><input type="text" v-model="inputSetTime"/>指定开始抢票时间(19:59:59)</div>
    <div>
      抢第
      <input
          type="text"
          v-model="piaoType"
      />种类型（没有填的话，按钱数判断，若有相同的钱数不能保证抢对票类型）
    </div>
    <div style="margin-top: 30px">当前时间：</div>
    <div> {{ currentTime }}</div>
    <div style="margin-top: 30px">抢票信息：</div>
    <div> {{ showSetTime }}</div>
    <div> {{ ticketInfo }}</div>


    <button @click="onclick">开始</button>
    <button @click="toStop">停止</button>
  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import axios from "axios";
import moment from "moment";

const tian = ref();
const qian = ref();
const time = ref();
const piaoId = ref();
const piaoType = ref();
let isStop = ref();
const inputSetTime = ref();
const currentTime = ref('');
let showSetTime = ref('');
let ticketInfo = ref('');

tian.value = 3;
qian.value = 58800;
time.value = 1;
piaoId.value = 73710;

const updateTime = () => {
  setInterval(() => {
    currentTime.value = moment().format('YYYY-MM-DD HH:mm:ss');
  }, 1000);
};

onMounted(() => {
  updateTime();
});


function showInfo() {
  const fullTime = moment().format('YYYY-MM-DD') + ' ' + inputSetTime.value;
  const parsedTime = moment(fullTime, 'YYYY-MM-DD HH:mm:ss', true);
  if (parsedTime.isValid()) {
    showSetTime.value = parsedTime;
  } else {
    showSetTime = 'Invalid time';
  }
}

function getTicketInfo(res) {
  let arr = res.data.data;
  let ticketList =
      arr.screen_list[tian.value ? tian.value - 1 : 0].ticket_list; //数组下标代表第几天   //票类型
  let getPiaoType = 0;
  if (piaoType.value) {
    getPiaoType = +piaoType.value - 1;
  } else {
    for (let i = 0; i < ticketList.length; i++) {
      if (ticketList[i].price === +qian.value) {
        getPiaoType = i;
        break;
      }
    }
  }
  console.log('ticket info', ticketList);
  const dateInfo = arr.screen_list[tian.value - 1].name;
  const ticketDesc = ticketList[getPiaoType].desc;
  ticketInfo.value = `日期: ${dateInfo}, 票: ${ticketDesc}`;
}

const onclick = () => {
  showInfo();
  const currentTime = moment();
  // const parsedTime = moment(showSetTime.value, 'YYYY-MM-DD HH:mm:ss');
  let delay = 0;
  if (showSetTime.value?.isValid()) {
    delay = showSetTime.value.diff(currentTime); // 计算当前时间与指定时间的毫秒差
  }
  console.log('delay:', delay);
  isStop.value = false;
  let grxx;
  axios({
    method: "GET",
    url: `/api/ticket/buyer/list?is_default&projectId=${piaoId.value}`,
  }).then((res) => {
    grxx = res.data.data.list;
    grxx[0].isBuyerInfoVerified = true;
    grxx[0].isBuyerValid = true;
  });

  axios({
    method: "GET",
    url: `/api/ticket/project/get?version=134&id=${piaoId.value}`,
  }).then((res) => {
    getTicketInfo(res);
  });

  setTimeout(() => {

    // 在指定时间后执行任务
    startBuyTickets(); // 开始定时循环任务
  }, delay);

  function startBuyTickets() {
    let data = setInterval(
        () => {
          axios({
            method: "GET",
            url: `/api/ticket/project/get?version=134&id=${piaoId.value}`,
          }).then((res) => {
            let arr = res.data.data;
            let ticketList =
                arr.screen_list[tian.value ? tian.value - 1 : 0].ticket_list; //数组下标代表第几天   //票类型
            let getPiaoType = 0;
            if (piaoType.value) {
              getPiaoType = +piaoType.value - 1;
            } else {
              for (let i = 0; i < ticketList.length; i++) {
                if (ticketList[i].price === +qian.value) {
                  getPiaoType = i;
                  break;
                }
              }
            }
            console.log('ticket info', ticketList);
            if (ticketList[getPiaoType].clickable) {
              console.log('is clickable');
              axios({
                //获取token
                method: "POST",
                url: `/api/ticket/order/prepare`,
                data: {
                  project_id: piaoId.value,
                  screen_id: arr.screen_list[tian.value ? tian.value - 1 : 0].id,
                  order_type: 1,
                  count: 1,
                  sku_id: ticketList[getPiaoType].id,
                  token: "",
                },
              }).then((res) => {

                let token = res.data.data.token;
                axios({
                  //抢
                  method: "POST",
                  url: `/api/ticket/order/createV2`,
                  data: {
                    project_id: piaoId.value,
                    screen_id: arr.screen_list[tian.value ? tian.value - 1 : 0].id,
                    sku_id: ticketList[getPiaoType].id,
                    count: 1,
                    pay_money: +qian.value,
                    order_type: 1,
                    timestamp: new Date().getTime(),
                    token: token,
                    deviceId: "3c2003ba05634736371935d33a47f77d",
                    buyer_info: JSON.stringify(grxx),
                  },
                }).then((res) => {
                  if (res.data.errno === 0 && res.data.errtag === 0) {
                    clearInterval(data);
                    alert("抢到了，请尽快去支付");
                  }
                });
              });
            }
          });
          if (isStop.value) {
            clearInterval(data); // Stop the interval
          }
        },
        time.value ? time.value * 1000 : 1000
    );
  }

};

const toStop = () => {
  isStop.value = true;
}
</script>

<style></style>
