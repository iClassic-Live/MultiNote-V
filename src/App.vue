<script>
export default {
  
  onLaunch(res) {
    console.log("MultiNote onLaunch");

    if (wx.getStorageInfoSync().keys.indexOf("note") === -1) wx.setStorageSync("note", []);
    if (wx.getStorageInfoSync().keys.indexOf("bgiCurrent") === -1) wx.setStorageSync("bgiCurrent", 0);

    wx.setStorageSync("bgiQueue", [
      //背景图地址队列
      "/static/images/bgi1.jpg",
      "/static/images/bgi2.jpg",
      "/static/images/bgi3.jpg",
      "/static/images/bgi4.jpg",
      "/static/images/bgi5.gif"
    ]);
    wx.removeStorageSync("item_to_edit");
    var note = wx.getStorageSync("note");
    var fileHasSaved = [];
    note.forEach(ele => {
      for (let prop in ele) {
        if (prop === "record" || prop === "image") {
          ele[prop].forEach(el => fileHasSaved.push(el));
        }else if (prop === "video") fileHasSaved.push(ele[prop]);
      }
    });
    wx.getSavedFileList({ 
      success: res => {
        res.fileList.forEach(ele => {
          if (fileHasSaved.indexOf(ele.filePath) === -1) wx.removeSavedFile({ filePath: ele.filePath || "" });
        });
      },
      fail: res => console.log("fail to get saved file list")
    });
  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow(res) {
    console.log("MultiNote onShow");
  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide(res) {
    console.log("MultiNote onHide");
  },

  onUnload(res) {
    console.log("MultiNote onUnload");
  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError(msg) {
    console.error("MultiNote onError", msg);
    (function showError () {
      wx.showToast({
        title: "运行出错！",
        image: "/static/images/error.png",
        mask: true,
        success: setTimeout(res => showError(), 1250)
      });
    })()
  }
}
</script>
