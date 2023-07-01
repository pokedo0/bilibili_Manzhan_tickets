const { defineConfig } = require('@vue/cli-service')
let gateway
let cookie
gateway = ' https://show.bilibili.com/'

cookie = `b_nut=1673612630; i-wanna-go-back=-1; _uuid=5883C59A-10598-7837-6173-E1935D9BF55C30415infoc; buvid4=38239556-5668-F439-3473-6AA0AE164DBC32065-023011320-0HQWf7U9Yhl2UOX5oLjtwA%3D%3D; rpdid=|(kmRY|)J|~m0J'uY~JYuk~u); LIVE_BUVID=AUTO3816736995247771; buvid_fp_plain=undefined; nostalgia_conf=-1; is-2022-channel=1; CURRENT_BLACKGAP=0; CURRENT_FNVAL=4048; hit-dyn-v2=1; CURRENT_PID=f81fbd80-cd79-11ed-b7aa-a36dfa7bedc0; b_ut=5; DedeUserID=293942714; DedeUserID__ckMd5=9e2bb0fa9dc16199; buvid3=EF56117D-D130-4425-9686-B6ABAEBD71AF36735infoc; hit-new-style-dyn=0; fingerprint=2575e8faaf2fb4fe93504f52afd4cdda; SESSDATA=c0f3c5ea%2C1703504740%2C8430c%2A61E9MBCnVSqoKEtowiM57GfFzIC36uoUTFdoTPqJGEWgsDRx80JjyMh8hiCHi5Wb_SaCCDgwAADgA; bili_jct=9d3b860e26329d96372526b8a2b21536; sid=8418l3ao; bp_video_offset_293942714=812462646821388300; FEED_LIVE_VERSION=V_NO_BANNER_3; header_theme_version=CLOSE; CURRENT_QUALITY=0; PVID=1; b_lsid=6E742E10D_1890EF91F03; buvid_fp=2575e8faaf2fb4fe93504f52afd4cdda; home_feed_column=4; innersign=0; browser_resolution=641-490; Hm_lvt_909b6959dc6f6524ac44f7d42fc290db=1687858146,1688018347,1688117238,1688177385; msource=pc_web; deviceFingerprint=8d6edf1828fdcf2d60634c4a27369c23; from=pc_search_sug; Hm_lpvt_909b6959dc6f6524ac44f7d42fc290db=1688178599`
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
