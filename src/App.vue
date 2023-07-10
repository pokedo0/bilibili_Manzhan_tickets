<template>
  <div>
    <div>只可以抢默认购票人</div>
    <div>票信息ID（url上有）<input type="text" v-model="piaoId" /></div>
    <div>第 <input type="text" v-model="tian" /> 天</div>
    <div>钱数<input type="text" v-model="qian" />（分）</div>
    <div><input type="text" v-model="time" />秒抢一次</div>
    <div>
      <input type="text" v-model="inputSetTime" />设定开始抢票时间(19:59:59)
    </div>
    <div>
      抢第
      <input
        type="text"
        v-model="piaoType"
      />种类型（没有填的话，按钱数判断，若有相同的钱数不能保证抢对票类型）
    </div>
    <div style="margin-top: 30px">当前时间：</div>
    <div>{{ currentTime }}</div>
    <div style="margin-top: 30px">抢票信息：</div>
    <div>{{ showSetTime }}</div>
    <div>{{ ticketInfo }}</div>

    <button @click="onclick">开始</button>
    <button @click="toStop">停止</button>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import axios from "axios";
import moment from "moment";

const tian = ref();
const qian = ref();
const time = ref();
const piaoId = ref();
const piaoType = ref();
let isStop = ref();
const inputSetTime = ref();
const currentTime = ref(""); //当前时间
let showSetTime = ref("");
let ticketInfo = ref("");

// bw
tian.value = 3;
qian.value = 58800;
time.value = 0.7;
piaoId.value = 73710;

// 可购
// tian.value = 1;
// qian.value = 9000;
// time.value = 0.7;
// piaoId.value = 71931;

const updateTime = () => {
  setInterval(() => {
    currentTime.value = moment().format("YYYY-MM-DD HH:mm:ss");
  }, 1000);
};

onMounted(() => {
  updateTime();
});

function showTimeInfo() {
  const fullTime = moment().format("YYYY-MM-DD") + " " + inputSetTime.value;
  const parsedTime = moment(fullTime, "YYYY-MM-DD HH:mm:ss", true);
  // todo 时间转换偶尔报错
  if (parsedTime.isValid()) {
    showSetTime.value = parsedTime;
  } else {
    showSetTime = "Invalid time";
  }
}

const onclick = () => {
  showTimeInfo(); //添加计划时间
  const currentTime = moment();
  let delay = 0;
  if (showSetTime.value?.isValid()) {
    delay = showSetTime.value.diff(currentTime); // 计算当前时间与指定时间的毫秒差
  }
  console.log("delay:", delay);
  isStop.value = false;
  let getPiaoType = 0;
  let ticketList;
  let arr;
  let grxx;
  axios({
    method: "GET",
    url: `/api/ticket/buyer/list?is_default&projectId=${piaoId.value}`,
  }).then((res) => {
    grxx = res.data.data.list;
    grxx[0].isBuyerInfoVerified = true;
    grxx[0].isBuyerValid = true;
    axios({
      method: "GET",
      url: `/api/ticket/project/get?version=134&id=${piaoId.value}`,
    }).then((res) => {
      arr = res.data.data;
      ticketList = arr.screen_list[tian.value ? tian.value - 1 : 0].ticket_list; //数组下标代表第几天   //票类型
      getPiaoType = 0;
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
      // 打印抢票信息
      console.log("ticket info", ticketList);
      const dateInfo = arr.screen_list[tian.value - 1].name;
      const ticketDesc = ticketList[getPiaoType].desc;
      ticketInfo.value = `日期: ${dateInfo}, 票: ${ticketDesc}`;
      setTimeoutTask();
    });
  });

  // 在指定时间后执行任务
  function setTimeoutTask() {
    setTimeout(() => {
      getToken();
    }, delay);
  }

  async function getToken() {
    await fetchClickableInfo();
    if (ticketList[getPiaoType].clickable) {
      console.log("is clickable");
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
        logErrorMsg(res);
        let token = res.data.data.token;
        createOrder(token); // 开始定时循环任务
      });
    }
  }

  // 循环判断是否可以开始抢售
  function fetchClickableInfo() {
    console.log("fetchClickableInfo");
    if (ticketList[getPiaoType].clickable) {
      return;
    }
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        axios({
          method: "GET",
          url: `/api/ticket/project/get?version=134&id=${piaoId.value}`,
        }).then((res) => {
          arr = res.data.data;
          ticketList = arr.screen_list[tian.value ? tian.value - 1 : 0].ticket_list; //数组下标代表第几天   //票类型
        });
        // 当满足条件时，停止定时任务，并解析 Promise
        if (ticketList[getPiaoType].clickable || isStop.value) {
          clearInterval(intervalId); // Stop the interval
          resolve();
        }
      }, time.value ? time.value * 1000 : 1000); // 设置适当的间隔时间
    });
  }

  function createOrder(token) {
    let setRepeatTask = setInterval(
      () => {
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
            deviceId: "3c2003ba05634736371905d33a47f77d",
            buyer_info: JSON.stringify(grxx),
          },
        }).then((res) => {
          logErrorMsg(res);
          if (res.data.errno === 0 && res.data.errtag === 0) {
            clearInterval(setRepeatTask);
            alert("抢到了，请尽快去支付");
          }
        });
        if (isStop.value) {
          clearInterval(setRepeatTask); // Stop the interval
        }
      },
      time.value ? time.value * 1000 : 1000
    );
  }

  function logErrorMsg(res) {
    if (res.data.errno !== 0) {
      console.log(res.data.msg);
    }
  }
};

const toStop = () => {
  isStop.value = true;
};
</script>

<style></style>
