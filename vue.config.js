const { defineConfig } = require('@vue/cli-service')
let gateway
let cookie
gateway = ' https://show.bilibili.com/'
cookie = `buvid3=90252EFA-0321-49E3-B025-9735EA4A99AD30815infoc; b_nut=1673612630; i-wanna-go-back=-1; _uuid=5883C59A-10598-7837-6173-E1935D9BF55C30415infoc; buvid4=38239556-5668-F439-3473-6AA0AE164DBC32065-023011320-0HQWf7U9Yhl2UOX5oLjtwA%3D%3D; rpdid=|(kmRY|)J|~m0J'uY~JYuk~u); LIVE_BUVID=AUTO3816736995247771; buvid_fp_plain=undefined; nostalgia_conf=-1; is-2022-channel=1; CURRENT_BLACKGAP=0; CURRENT_FNVAL=4048; header_theme_version=CLOSE; hit-new-style-dyn=1; hit-dyn-v2=1; CURRENT_PID=f81fbd80-cd79-11ed-b7aa-a36dfa7bedc0; FEED_LIVE_VERSION=V8; bp_video_offset_457117501=793669510849626200; b_ut=5; CURRENT_QUALITY=120; fingerprint=2575e8faaf2fb4fe93504f52afd4cdda; bsource=search_baidu; bp_video_offset_293942714=800731059859751000; msource=pc_web; deviceFingerprint=8d6edf1828fdcf2d60634c4a27369c23; Hm_lvt_909b6959dc6f6524ac44f7d42fc290db=1683291810,1683300967,1683540700,1685273298; from=ticket_home; PVID=2; buvid_fp=fbeb40928a470c669367063a2e0781df; innersign=0; b_lsid=69A3B9104_1886270B965; SESSDATA=475f58c7%2C1700830933%2C982dc%2A52; bili_jct=28a5b67db7b7323c3b2d0ae4bcbbe047; DedeUserID=293942714; DedeUserID__ckMd5=9e2bb0fa9dc16199; sid=8abfccj0; home_feed_column=4; browser_resolution=850-915; Hm_lpvt_909b6959dc6f6524ac44f7d42fc290db=1685278943`
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: "localhost",
    port: 8080,
    open: true,
    proxy: {
      "/api": {
        target: "https://show.bilibili.com/",
        changeOrigin: true,
        ws: true,
        headers: {
          Cookie: cookie,
          Referer: gateway,
          Origin: gateway,
        },
      }
    },
  },
})
