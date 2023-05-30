<template>
  <div>
    <div>只可以抢默认购票人,只适用miyoSummer</div>
    <div>第 <input type="text" v-model="tian" /> 天</div>
    <div>钱数<input type="text" v-model="qian" /></div>
    <div><input type="text" v-model="time" />秒抢一次</div>
    <button @click="onlick">开始</button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
const tian = ref();
const qian = ref();
const time = ref();
const onlick = () => {
  let data = setInterval(
    () => {
      axios({
        method: "GET",
        url: `/api/ticket/project/get?version=134&id=68575`,
      }).then((res) => {
        let arr = res.data.data;
        let ticketList =
          arr.screen_list[tian.value ? tian.value - 1 : 0].ticket_list; //数组下标代表第几天   //票类型
        for (let i = 0; i < ticketList.length; i++) {
          if (ticketList[i].clickable) {
            Promise.all([
              //获取个人信息
              axios({
                method: "GET",
                url: `/api/ticket/buyer/list?is_default&projectId=68575`,
              }),
              axios({
                //获取token
                method: "POST",
                url: `/api/ticket/order/prepare`,
                data: {
                  project_id: 68575,
                  screen_id:
                    arr.screen_list[tian.value ? tian.value - 1 : 0].id,
                  order_type: 1,
                  count: 1,
                  sku_id: ticketList[i].id,
                  token: "",
                },
              }),
            ]).then((res) => {
              let token = res[1].data.data.token;
              let grxx = res[0].data.data.list;
              grxx[0].isBuyerInfoVerified = true;
              grxx[0].isBuyerValid = true;
              axios({
                //抢
                method: "POST",
                url: `/api/ticket/order/createV2`,
                data: {
                  project_id: 68575,
                  screen_id:
                    arr.screen_list[tian.value ? tian.value - 1 : 0].id,
                  sku_id: ticketList[i].id,
                  count: 1,
                  pay_money: +qian.value,
                  order_type: 1,
                  timestamp: new Date().getTime(),
                  token: token,
                  deviceId: "3c2003ba05634736371935d33a47f77f",
                  buyer_info: JSON.stringify(grxx),
                },
              }).then((res) => {
                if (res.data.data && res.data.data.length) {
                  clearInterval(data);
                  alert("抢到了，请尽快去支付");
                }
              });
            });
            break;
          }
        }
      });
    },
    time.value ? time.value * 1000 : 1000
  );
};
</script>

<style></style>
