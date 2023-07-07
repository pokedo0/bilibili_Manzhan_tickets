<template>
  <div>
    <div>只可以抢默认购票人</div>
    <div>票信息ID（url上有）<input type="text" v-model="piaoId" /></div>
    <div>第 <input type="text" v-model="tian" /> 天</div>
    <div>钱数<input type="text" v-model="qian" />（分）</div>
    <div><input type="text" v-model="time" />秒抢一次</div>
    <div>
      抢第
      <input
        type="text"
        v-model="piaoType"
      />种类型（没有填的话，按钱数判断，若有相同的钱数不能保证抢对票类型）
    </div>
    <button @click="onlick">开始</button>
    <button @click="toStop">停止</button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
const tian = ref();
const qian = ref();
const time = ref();
const piaoId = ref();
const piaoType = ref();
let isStop = ref();

const onlick = () => {
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
        if (ticketList[getPiaoType].clickable) {
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
};
const toStop = () => { isStop.value = true; }
</script>

<style></style>
