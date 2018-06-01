<template>
    <view id="page">

        <scroll-view id="background">
          <img v-bind:src="backgroundImage">
        </scroll-view>

        <view id="mainFn">
            <view class="logo module">
              <img mode="widthFix" src="/static/images/logo.png">
            </view>
            <view class="startUsing module">
              <img mode="widthFix" src="/static/images/start.png" @tap="startUsing">
            </view>
            <view class="motto module">
              <img mode="widthFix" src="/static/images/motto.png">
            </view>
            <view class="versionSign">
              <text>Version：{{version}}</text>
            </view>
        </view>
              
    </view>
</template>

<style>
#page {
  height: 100%;
  width: 100%;
}

#background {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: -1;
}
#background img {
  height: 100%;
  width: 100%;
}

#mainFn {
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.module {
  height: 100%;
  display: flex;
  align-items: center;
}
.logo image {
  position: relative;
  top: 5vh;
  height: 40vw;
  width: 40vw;
}
.startUsing image {
  position: relative;
  top: 5vh;
  height: 20vw;
  width: 46vw;
}
.motto image {
  position: relative;
  top: 2.5vh;
  height: 9vw;
  width: 96vw;
}
.versionSign {
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 0 0.5em;
  font-weight: bold;
  background-color: rgba(255, 255, 255, 0.25);
}
</style>

<script>
export default {

  data() {
    return {

      version: "MultiNote V1.6.2 Build",

      backgroundImage: wx.getStorageSync("bgiQueue")[wx.getStorageSync("bgiCurrent")]
      
    }
  },


  /* 原生生命周期函数--监听页面加载 */
  onLoad(res) {
    console.log("Home onLoad");
    this.backgroundImage = wx.getStorageSync("bgiQueue")[wx.getStorageSync("bgiCurrent")];
  },


  methods: {

    startUsing(res) {
      if (wx.getStorageSync("note").length > 0) {
        wx.showLoading({
          title: "正在进入读记事",
          mask: true
        });
        wx.redirectTo({ url: "../ShowNote/main" });
      } else {
        wx.showLoading({
          title: "正在进入写记事",
          mask: true
        });
        wx.redirectTo({ url: "../CreateNote/main" });
      }
    }

  },


};
</script>