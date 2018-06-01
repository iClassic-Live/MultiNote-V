<template>
    <view id="page" v-bind:style="{display:ifReady ? 'block' : 'none'}">
        
        <scroll-view id="background">
            <swiper v-bind:current="current" circular="true" v-bind:autoplay="autoplay" interval="0" v-bind:duration="duration">
                <swiper-item v-for="item in bgiQueue" :key="item">
                    <img mode="aspectFill" v-bind:src="item"/>
                </swiper-item>
            </swiper>
        </scroll-view>

        <view id="main">

            <view class="overview" v-bind:style="{display: sw === 'overview' ? 'block' : 'none',
            'background-color': searching ? 'rgba(255, 255, 255, 0.5)' : 'none'}">

                <view class="search">
                  <view class="input">
                      <input placeholder="记事检索" v-bind:value="input" v-bind:focus="searching"
                       @focus="search" @input="search"/>
                  </view>
                  <view class="setSearchType" @tap="search">
                      <button>{{ searchType }}</button>
                  </view>
                </view>

                <scroll-view class="list" scroll-y="true" v-bind:scroll-into-view="target"
                  @tap="tapFn_on_overview">
                    <view class="item" v-bind:id="'n' + index" v-for="(item, index) in (searching ? result : note)" :key="index"
                        v-bind:style="{opacity:item.style.opacity}" @touchstart="pullOutDel_Menu" @touchmove="pullOutDel_Menu" @touchend="pullOutDel_Menu"
                        @tap.stop="tapFn_on_item">
                        <view class="title" v-bind:style="{'background-color': item.style.bgc}">
                            <text v-bind:style="{color:item.style.fontColor}">{{ item.title }}</text>
                        </view>
                        <view class="del" v-if="!searching" v-bind:id="'del_' + index"
                        v-bind:style="{left: -(120 - item.style.pullOutDelete) + 'rpx'}" @tap.stop="deleteNote">删除</view>
                        <view class="menu" v-if="!searching" v-bind:style="{right: -(330 - item.style.pullOutMenu) + 'rpx'}">
                            <img v-bind:id="'text_' + index" mode="aspectFit" src="/static/images/text.png" @tap.stop="getContent">
                            <img v-bind:id="'record_'+ index" mode="aspectFit" src="/static/images/record.png" @tap.stop="getContent">
                            <img v-bind:id="'image_' + index" mode="aspectFit" src="/static/images/image.png" @tap.stop="getContent">
                            <img v-bind:id="'video_' + index" mode="aspectFit" src="/static/images/video.png" @tap.stop="getContent">
                        </view>
                    </view>
                </scroll-view>

                <view class="bottom" @tap="tapFn_on_overview">
                    <view class="bgiChange" v-bind:style="{display: searching ? 'none' : 'block'}">
                        <view class="bgiChange_cp">
                        <img src="/static/images/bgiChange.png" v-bind:style="{left: 50 * bgiChange + '%'}" 
                            @touchstart="changeBackgroundImage" @touchmove="changeBackgroundImage"
                            @touchend="changeBackgroundImage">
                        </view>
                    </view>
                    <view class="new" v-bind:style="{display: searching ? 'none' : 'block'}">
                        <img src="/static/images/new.png" @tap="createNote">
                    </view>
                </view>
            </view>

            <view class="content" v-bind:style="{display:sw === 'overview' ? 'none' : 'block'}">

                <view class="head">
                    <view class="title">
                        <text class="tag">摘要：</text>
                        <textarea disabled="true" v-bind:value="title"></textarea>
                    </view>
                    <view class="exit">
                        <img v-bind:src="'/static/images/' + (sw ? sw === 'overview' ? 'null' : sw : 'null') + '.png'"
                         mode="aspectFit" @tap="backToOverview">
                    </view>
                </view>

                <view class="show" @touchstart="jumpToAnother" @touchend="jumpToAnother">

                  <view class="text" 
                      v-bind:style="{display:sw === 'text' ? 'block' : 'none'}">
                      <textarea v-model="text.content" disabled="true" @longpress="getTextInfo"
                      v-bind:style="{color: text.fontColor, 'font-weight':text.fontWeight, 'font-size':text.fontSize}">
                      </textarea>
                  </view>
                  
                  <view class="record"
                      v-bind:style="{display:sw === 'record' ? '' : 'none'}" @tap.stop="getRecordInfo">
                      <button v-bind:id="'record-item_' + index" v-for="(item, index) in playback" 
                      :key="index" v-bind:style="{opacity:item.opacity}" @tap.stop="getRecordInfo">
                      {{index + 1}}
                      </button>
                  </view>

                  <view class="image image_cp" v-bind:style="{display:sw === 'image' ? 'block' : 'none'}">
                      <swiper class="image_cp" circular="true" v-bind:current="imgCurrent"
                      indicator-dots="true" indicator-active-color="#fff" @change="getImageInfo">
                          <swiper-item class="image_cp" v-bind:id="'images_' + index"
                              v-for="(item, index) in img" :key="index" @tap="getImageInfo" @longpress="getImageInfo">
                              <img class="image_cp" v-bind:src="item.path" mode="aspectFit">
                          </swiper-item>
                      </swiper>
                  </view>

                  <view class="video video_cp" v-bind:style="{display:sw === 'video' ? 'block' : 'none'}">
                      <video class="video_cp" v-bind:src="video" @longpress="getVideoInfo"></video>
                  </view>
                
                </view>

            </view>

        </view>

    </view>
</template>

<style>
#page {
  height: 100%;
  background-color: #708090;
}



  /* 背景 */
  #background {
    position: absolute; 
    height: 100%;
    width: 100%;
    z-index: -1;
  }
  #background swiper {
    height: 100%;
    width: 100%;
  }
  #background swiper-item {
    height: 100%;
    width: 100%;
  }
  #background img {
    height: 100%;
    width: 100%;
  }



/* 主界面  */
  #main {
    position: absolute;
    height: 100%;
    width: 100%;
  }

  /* 概览区 */
    #main .overview {
      height: 100%;
      width: 100%;
    }

    /* 搜索框 */
      .overview .search {
        box-sizing: border-box;
        height: 7.5%;
        width: 100%;
        display: flex;
      }
      .search .input {
        flex: 1;
        box-sizing: border-box;
        height: 100%;
        padding: 0 1%;
        border: 6rpx solid #cc0000;
        border-radius: 20rpx;
        background-color: rgba(255, 255, 255, 0.5);
      }
      .search .input input {
        height: 100%;
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
      }
      .search .setSearchType {
        box-sizing: border-box;
        height: 100%;
        width: 7.5vh;
        border: 6rpx solid black;
        border-radius: 50%;
      }
      .setSearchType button {
        height: 100%;
        width: 100%;
        border-radius: 50%;
        font-size: 5vh;
        font-weight: bolder;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.5);
      }

    /* 列表区 */
      .overview .list {
        box-sizing: border-box;
        height: 80%;
        width: 100%;
        padding-top: 1%;
      }
      .list .item {
        position: relative;
        height: 7.5%;
        width: 100%;
        margin: 0.5vw 0;
      }
      .item:first-of-type {
        margin-top: 0;
      }
      .item .title{
        position: absolute;
        box-sizing: border-box;
        height: 100%;
        width: 100%;
        padding: 0 1%;
        border: 4.5rpx solid #8B4513;
        border-radius: 15rpx;
        background-color: rgba(255, 255, 255, 0.5);
        white-space: nowrap;
      }
      .title text {
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        overflow: hidden;
      }
      .item .del {
        position: absolute;
        box-sizing: border-box;
        left: 0;
        height: 100%;
        padding: 0 0.25em;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bolder;
        border: 4.5rpx solid #8B4513;
        border-radius: 15rpx;
        border-top-right-radius: 0;        
        border-bottom-right-radius: 0;    
        border-right: none;    
        background-color: #f00;
      }
      .item .menu {
        position: absolute;
        right: 0;
        box-sizing: border-box;
        height: 100%;
        padding: 4.5rpx 0;
        width: 45%;
      }
      .menu img {
        height: 100%;
        width: 25%;
      }


    /* 底部 */
      .overview .bottom {
         position: relative; 
        height: 12.5%;
        width: 100%;
        display: flex;
        align-items: center;
      }

      .bottom .bgiChange {
        position: absolute;
        left: 20%;
        height: 100%;
        width: 12.5vh;
      }
      .bgiChange .bgiChange_cp {
        margin: 25% 25%;
        height: 10vw;
        width: 10vw;
        background: radial-gradient(circle ,rgba(255, 255, 255, 0.5), #00f);
        border-radius: 50%;
      }
      .bgiChange_cp img {
        position: relative;
        height: 100%;
        width: 100%;
      }
      
      .bottom .new {
        position: absolute;
        right: 5%;
        height: 100%;
        width: 12.5vh;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .new img {
        height: 75%;
        width: 75%;
      }
      
  /* 内容区 */
    #main .content {
      height: 100%;
      width: 100%;
      background-color: rgba(255, 255, 255, 0.5);
    }

    /* 头部 */
      .content .head {
          position: relative;
          height: 10%;
          width: 100%;
      }

      /* 标题栏 */
        .head .title {
          position: absolute;
          left: 0;
          height: 100%;
          width: 80%;
          display: flex;
          align-items: center;
        }
        .head .title text {
          flex: none;
          height: 100%;
          width: 3em;
          padding-left: 0.5em;
          font-weight: bolder;
        }
        .head .title textarea {
          flex: 1;
          max-height: 100%;
          display: flex;
          line-height: 10vh;
          vertical-align: middle;
          font-weight: bolder;
        }
      /* 退出按钮 */
        .head .exit {
          position: absolute;
          right: 0;
          height: 100%;
          width: 20%;
        }
        .head img {
          height: 100%;
          width: 100%;
        }

    /* 内容展示区 */
      .content .show {
        box-sizing: border-box;
        height: 90%;
        width: 100%;
        border: 6rpx solid black;
      }

      /* 文本展示区 */
        .show .text {
          height: 100%;
          width: 100%;
        }
        .text textarea {
          height: 100%;
          width: 100%;
          background: -webkit-gradient(linear, left top, left bottom, from(#000), color-stop(5%, rgba(255, 255, 255, 0)));
          background-size: 100% 1em;
        }

      /* 语音展示区 */
        .show .record {
          height: 100%;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .record button {
          height: 125rpx;
          width: 125rpx;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          background-color: #F5F5DC;
        }
      
      /* 图片展示区 */
      .content .image_cp {
        height: 100%;
        width: 100%;
      }

      /* 视频展示区 */
        .content .video_cp {
          height: 100%;
          width: 100%;
        }
</style>

<script>

const SWT = 750 / wx.getSystemInfoSync().screenWidth;  //获取用户本机的相对像素比

const innerAudioContext = wx.createInnerAudioContext();  //创建并返回内部 audio 上下文

var temp;  //临时数据存储器

export default {


    data() {
        return {

            ifReady: false,

            duration: 0,
            current: wx.getStorageSync("bgiCurrent"),
            bgiQueue: wx.getStorageSync("bgiQueue"),
            autoplay: false,
            bgiChange: 0,

            sw: "overview",

            searching: false,
            searchType: "T",
            input: "",
            result: new Array(),
            target: "",

            note: new Array(),

            title: "",

            text: { content: "" },

            playback: new Array(),

            img: new Array(),
            imgCurrent: 0,

            video: ""

        }
    },


    /* 原生生命周期函数--监听页面加载 */
    onLoad(res) {
        console.log("ShowNote onLoad");
        wx.hideLoading();
        var bgiCurrent = wx.getStorageSync("bgiCurrent");
        if (this.current !== bgiCurrent) this.current = bgiCurrent;

        this.searchType = "T";
        this.target = "";

        var storage = wx.getStorageSync("note");
        this.note = storage.map(ele => {
            return {
                title: ele.title,
                style: {
                    opacity: 1,
                    pullOutDelete: 0,
                    pullOutMenu: 0,
                    bgc: "rgba(255, 255, 255, 0.5)"
                }
            }
        });

        temp = {  //初始化临时数据存储器

          anchor: [null, null, null], //相应滑动操作的起始标识

          note: storage.map(ele => { //所有记事的内容
                delete ele.title;
                return ele;
          })

        }
    },

    /* 原生生命周期函数--监听页面显示 */
    onShow(res) {
        console.log("ShowNote onShow");
        if (!this.ifReady) {
            var bgiCurrent = wx.getStorageSync("bgiCurrent");
            if (this.current === bgiCurrent) {
                if (this.duration !== 500) this.duration = 500;
            } else this.current = bgiCurrent;   
        }
    },

    /* 原生生命周期函数--监听页面初次渲染完成 */
    onReady(res) {
      console.log("ShowNote onReady");
      if (this.duration !== 500) this.duration = 500;
      this.ifReady = true;
    },

    /* 原生生命周期函数--监听页面隐藏 */
    onHide: res => console.log("ShowNote onHide"),

    /* 原生生命周期函数--监听页面卸载 */
    onUnload: res => this.a.data.ifReady = false,


    methods: {

      //概览区白区的点击操作
      tapFn_on_overview(res) {
        if (this.searching) {
          this.backToOverview();
        }else this.hideMenu();
      },
      //列表项的点击操作
      tapFn_on_item(res) {
        if (!this.searching) {
          var index = res.currentTarget.id.match(/\d+/g)[0];
          var style = this.note[index].style;
          if (style.pullOutDelete !== 0 || style.pullOutMenu !== 0) { //取消菜单栏/删除按钮的拉出
            this.hideMenu();
          }else this.editNote(res);
        }else this.gotoResult(res);
      },

      //记事检索功能
      search(res) {
        switch(res.type) {
          case "focus": {
            if (!this.searching) this.searching = true;
            this.showSearchType();
          }break;
          case "input": {
            if (!this.searching) this.searching = true;
            this.input = res.mp.detail.value;
            this.getResult(this.input, this.searchType);
          }break;
          case "tap": {
            switch(this.searchType) {
                case "T": { this.searchType = "C"; }break;
                case "C": { this.searchType = "T"; }break;
            }
            this.showSearchType();
            this.getResult(this.input, this.searchType);
          }break;
        }
      },
      //获取并展示搜索结果
      getResult(input, searchType) {
        if (input === undefined || input === null) {  //容错
            input = "";
        }else input = input.toString();
        if (input.length > 0) {
        var reg = new RegExp(input.split("").map(ele => {  //若input中有元字符则转义该元字符后再编译正则表达式
            if ("*.?+$^[](){}|\\/".split("").some(el => el === ele)) {
                return "\\" + ele;
            }else return ele;
        }).join(""));
        var result = [];
        switch(this.searchType) {
            case "T": {
                this.note.map(ele => reg.test(ele.title) ? result.push(ele) : "");
            }break;
            case "C": {
                temp.note.map(ele => {
                    if (reg.test(ele.text.content)) {
                        let contentIndex = ele.text.content.indexOf(this.input);
                        let title = ele.text.content.substring(contentIndex);
                        if (contentIndex > 0) title = "..." + title;
                        result.push({
                            title: title,
                            style: {
                                opacity: 1,
                                bgc: "rgba(255, 255, 255, 0.5)"
                            }
                        });
                    }
                });
            }break;
        }
        this.result = result;
        }else this.result = [];
      },
      //提示正在检索的目标的类型
      showSearchType(res) {
        wx.showToast({
            title: "检索记事" + (() => {
            switch(this.searchType) {
                case "T": { return "标题" }break;
                case "C": { return "文本" }break;
            }
            })(),
            icon: "none"
        });
      },
      //获取所点击的搜索结果所在概览中的位置或阅览所点击的搜索结果的文本记事
      gotoResult(res) {
        var index = res.currentTarget.id.match(/\d+/g)[0];
        this.searching = false;
        this.result = [];
        this.input = "";
        this.target = res.currentTarget.id;
        switch(this.searchType) {
          case "T": {
            (function show() {
              if (!temp.hasOwnProperty("times")) temp.times = 0;
              if (temp.times % 2 === 0) {
                this.note[index].style.bgc = "#f00";
                this.note[index].style.fontColor = "#fff";
              } else {
                this.note[index].style.bgc = "rgba(255, 255, 255, 0.5)";
                this.note[index].style.fontColor = "#000";
              }
              if (temp.times !== 3) {
                ++temp.times;
                setTimeout(() => show.call(this), 250);
              } else delete temp.times;
            }).call(this);
          }break;
          case "C": {
            this.sw = "text";
            this.title = this.note[index].title;
            var note = temp.note[index];
            this.text = note.text;
            if (note.record.length > 0) this.playback = note.record;
            if (note.image.length > 0) this.img = note.image;
            if (note.video.length > 0) this.video = note.video;
          }break;
        }
      },

      //列表项各子项下删除按钮和菜单栏的拉动操作
      pullOutDel_Menu(res) {
          var index = res.currentTarget.id.match(/\d+/g)[0];
          if (res.type === "touchstart") {
              var touch = res.clientX * SWT;
              if (touch < 112.5 || touch > 637.5) temp.anchor[0] = touch;
              if (touch < 112.5) this.hideMenu(index, "pullOutDelete");
              if (touch > 637.5) this.hideMenu(index, "pullOutMenu");
          } else if (res.type === "touchmove" && typeof temp.anchor[0] === "number") {
              var moveDistance = Math.abs(res.clientX * SWT - temp.anchor[0]);
              if (temp.anchor[0] > 637.5 && moveDistance <= 330) {
                  this.note[index].style.pullOutMenu = moveDistance;
              } else if (temp.anchor[0] < 112.5 && moveDistance <= 120) {
                  this.note[index].style.pullOutDelete = moveDistance;
              }
          } else if (res.type === "touchend" && typeof temp.anchor[0] === "number") {
              if (temp.anchor[0] > 637.5) {
                  if (this.note[index].style.pullOutMenu > 82.5) {
                      (function pullOutMenu () {
                          this.note[index].style.pullOutMenu += 8.25;
                          if (this.note[index].style.pullOutMenu < 330) {
                              setTimeout(() => { pullOutMenu.call(this); }, 6.25);
                          } else this.note[index].style.pullOutMenu = 330;
                      }).call(this);
                  } else this.hideMenu(index, "pullOutDelete");
              } else if (temp.anchor[0] < 112.5) {
                  if (this.note[index].style.pullOutDelete > 60) {
                      (function pullOutDelete () {
                          this.note[index].style.pullOutDelete += 3;
                          if (this.note[index].style.pullOutDelete < 120) {
                              setTimeout(() => { pullOutDelete.call(this); }, 6.25);
                          } else this.note[index].style.pullOutDelete = 120;
                      }).call(this);
                  } else this.hideMenu(index, "pullOutMenu");
              }
              delete temp.anchor[0];
          }
      },
      //列表项各子项下记事的修改操作
      editNote(res) {
        var index = res.currentTarget.id.match(/\d+/g)[0];
        this.hideMenu();
        this.note[index].style.bgc = "#f00";
        this.note[index].style.fontColor = "#fff";
        wx.showModal({
            title: "读记事",
            content: "是否修改当前记事？",
            success: res => {
                this.note[index].style.bgc = "rgba(255, 255, 255, 0.5)";
                this.note[index].style.fontColor = "#000";
                if (res.confirm) {
                    wx.setStorageSync("item_to_edit", index);
                    wx.redirectTo({ url: "../CreateNote/main" });
                }
            }
        });
      },
      //列表项各子项下的删除操作
      deleteNote(res) {
          var index = res.currentTarget.id.match(/\d+/g)[0];
          this.hideMenu(e => {
            this.note[index].style.bgc = "#F00";
            this.note[index].style.fontColor = "#fff";
          });
          wx.showModal({
              title: "读记事",
              content: "是否删除本条记事？",
              success: res => {
                if (res.confirm) {
                    wx.showLoading({
                        title: "开始删除本记事",
                        mask: true
                    });
                    var note = temp.note[index];
                    var restToDelete = note.record.length + note.image.length + 1;
                    var rewriteData = () => {
                        this.note.splice(index, 1);
                        temp.note.splice(index, 1);
                        var storage = wx.getStorageSync("note");
                        storage.splice(index, 1);
                        wx.setStorageSync("note", storage);
                        wx.hideLoading();
                        wx.showToast({
                            title: "本条记事已删除",
                            image: "/static/images/success.png",
                            mask: (() => {
                                if (this.note.length === 0) {
                                    setTimeout(() => wx.redirectTo({ url: "../CreateNote/main" }), 1500);
                                    return true;
                                }else return false;
                            })()
                        });
                    }
                    var removeSavedFile = path => {
                        wx.removeSavedFile({
                            filePath: path || "",
                            complete: res => {
                                restToDelete -= 1;
                                if (restToDelete === 0 && this.note[index].style.opacity <= 0) rewriteData();
                            }
                        });
                    }
                    (function deleting () {
                        this.note[index].style.opacity -= 0.05;
                        if (this.note[index].style.opacity > 0) {
                            setTimeout(() => deleting.call(this), 25);
                        }else if (restToDelete === 0) rewriteData();
                    }).call(this);
                    note.record.forEach(ele => removeSavedFile(ele.path));
                    note.image.forEach(ele => removeSavedFile(ele.path));
                    removeSavedFile(note.video);
                } else {
                    this.note[index].style.bgc = "rgba(255, 255, 255, 0.5)";
                    this.note[index].style.fontColor = "#000";
                }
              }
          });
      },
      //列表项各子项下的记事内容获取操作
      getContent(res) {
          var label = res.currentTarget.id;
          var index = label.match(/\d+/g)[0];
          label = label.slice(0, label.indexOf("_"));
          if (label === "text") {
              var condition = temp.note[index].text.content.length > 0
          } else var condition = temp.note[index][label].length > 0;
          if (condition) {
              this.hideMenu();
              this.sw = label;
              this.title = this.note[index].title;
              let note = temp.note[index];
              if (note.text.content.length > 0) this.text = note.text;
              if (note.record.length > 0) this.playback = note.record.map(ele => {
                  ele.opacity = 1;
                  return ele;
              });
              if (note.image.length > 0) this.img = note.image;
              if (note.video.length > 0) this.video = note.video;
          } else {
              switch (label) {
                  case "text": var content = "文本记事"; break;
                  case "record": var content = "语音记事"; break;
                  case "image": var content = "图片记事"; break;
                  case "video": var content = "视频记事"; break;
              }
              wx.showToast({
                  title: "该项无" + content,
                  image: "/static/images/warning.png"
              });
          }
      },
      //复位所有除指定排除项以外未复位的删除按钮和菜单栏
      hideMenu(id, type) {
          var unhiddenQueue = [];
          this.note.forEach((ele, index) => {
              if (ele.style.pullOutDelete > 0) unhiddenQueue.push({ type: "pullOutDelete", index: index });
              if (ele.style.pullOutMenu > 0) unhiddenQueue.push({ type: "pullOutMenu", index: index });
          });
          const args = arguments;
          var restToHide = unhiddenQueue.length;
          unhiddenQueue.forEach((ele, index) => {
              if (ele.type !== type || ele.index !== parseInt(id)) {
                  (function hiding (target, step) {
                    this.note[ele.index].style[target] -= step;
                    if (this.note[ele.index].style[target] > 0) {
                        setTimeout(() => hiding.apply(this, [target, step]), 6.25);
                    } else {
                        restToHide -= 1;
                        this.note[ele.index].style[target] = 0;
                        if (restToHide === 0) for (let arg of args) if (typeof arg === "function") arg();
                    }
                  }).apply(this, [ele.type, /Menu/.test(ele.type) ? 8.25 : 3])
              }
          });
          if (restToHide === 0) for (let arg of args) if (typeof arg === "function") arg();
      },

      //背景图的切换
      changeBackgroundImage(res) {
          if (res.type === "touchstart") {
              temp.anchor[0] = res.mp.changedTouches[0].pageX;
          } else if (res.type === "touchmove") {
              var moveDistance = (res.mp.changedTouches[0].pageX - temp.anchor[0]) * SWT;
              if (Math.abs(moveDistance) > 37.5) {
                  if (moveDistance > 0) {
                      this.bgiChange = 1;
                  } else this.bgiChange = -1;
              } else this.bgiChange = moveDistance / 37.5;
          } else if (res.type === "touchend") {
              switch (this.bgiChange) {
                  case 1: {
                      if (this.current < this.bgiQueue.length - 1) {
                          this.current += 1;
                      } else {
                          this.autoplay = true;
                          this.autoplay = false;
                          this.current = 0;
                      }
                      break;
                  }
                  case -1: {
                      if (this.current > 0) {
                          this.current -= 1;
                      } else this.current = this.bgiQueue.length - 1;
                      break;
                  }
              }
              if (this.bgiChange !== 0) {
                  this.bgiChange = 0;
                  wx.setStorageSync("bgiCurrent", this.current);
              }
          }
      },

      //记事的新建
      createNote: res => wx.redirectTo({ url: "../CreateNote/main" }),

      //返回概览区
      backToOverview(res) {
          setImmediate(() => {
            if (!this.searching) {
                this.sw = "overview";
                if ((temp.timerQueue || []).length > 0) {
                    if (temp.timerQueue.length > 0) innerAudioContext.stop();
                    for (let timer of temp.timerQueue) clearTimeout(timer);
                    temp.timerQueue = [];
                }
                if (this.title !== "") this.title = "";
                if (this.text.content !== "") this.text = { content: "" };
                if (this.playback.length > 0) this.playback = [];
                if (this.img.length > 0) this.img = [];
                if (this.video !== "") this.video = "";
            } else {
                this.searching = false;
                if (this.input !== "") this.input = "";
                if (this.result.length > 0) this.result = new Array();
            }
          });
      },
      //记事文本的操作
      getTextInfo(res) {
          wx.setClipboardData({
              data: this.text.content,
              success: res => {
                  wx.showToast({
                      title: "成功复制文本！",
                      image: "/static/images/success.png",
                  });
              },
              fail: res => {
                  wx.showToast({
                      title: "无法复制文本！",
                      image: "/static/images/error.png"
                  });
              }
          });
      },
      //记事语音的操作
      getRecordInfo(res) {
          if (!!res.currentTarget.id) {
            var index = res.currentTarget.id.match(/\d+/g)[0];
            var timeStamp = new Date().getTime();
            if ((temp.timerQueue || []).length > 0) {
                innerAudioContext.stop();
                for (let value of temp.timerQueue) clearTimeout(value);
                this.playback.forEach(ele => ele.opacity = 1);
                temp.timerQueue = [];
            } else temp.timerQueue = [];
            innerAudioContext.autoplay = true;
            innerAudioContext.src = this.playback[index].path;
            (function breathingEffection () {
                if (this.playback[index].opacity >= 1) temp.flag = true;
                if (this.playback[index].opacity <= 0.3) temp.flag = false;
                var timer = setTimeout(() => {
                    if (new Date().getTime() - timeStamp < this.playback[index].duration - 35) {
                        if (temp.flag) {
                            this.playback[index].opacity -= 0.025;
                        } else this.playback[index].opacity += 0.025;
                        breathingEffection.call(this);
                    } else {
                        this.playback[index].opacity = 1;
                        temp.timerQueue.splice(temp.timerQueue.indexOf(timer), 1);
                        delete temp.flag;
                    }
                }, 35);
                if (temp.timerQueue.indexOf(timer) === -1) temp.timerQueue.push(timer);
            }).call(this);
          }else {
            if ((temp.timerQueue || []).length > 0) {
                innerAudioContext.stop();
                for (let value of temp.timerQueue) clearTimeout(value);
                this.playback.forEach(ele => ele.opacity = 1);
                temp.timerQueue = [];
            } else temp.timerQueue = [];
          }
      },
      //记事图片的操作
      getImageInfo(res) {
          var index = res.currentTarget.id.match(/\d+/g)[0];
          if (res.type === "tap") {
              wx.previewImage({ urls: [this.img[index].path] });
          }else if (res.type === "longpress") {
            var saveImage = () => {
                wx.showModal({
                    title: "读记事",
                    content: "是否保存当前图片到本地？",
                    success: res => {
                        if (res.confirm) {
                            wx.saveImageToPhotosAlbum({
                                filePath: this.img[index].path,
                                success: res => {
                                    wx.showToast({
                                        title: "保存图片成功！",
                                        image: "/static/images/success.png"
                                    });
                                },
                                fail: res => {
                                    wx.showToast({
                                        title: "保存图片失败！",
                                        image: "/static/images/error.png"
                                    });
                                }
                            });
                        }
                    }
                });
            }
            function failure() {
                wx.showModal({
                    title: "读记事",
                    content: "警告：没有保存到相册的权限，无法保存图片到本地！",
                    showCancel: false
                });
            }
            wx.getSetting({
                success: res => {
                    if (!res.authSetting["scope.writePhotosAlbum"]) {
                        wx.authorize({
                            scope: 'scope.writePhotosAlbum',
                            success: res => saveImage(),
                            fail:res => {
                                wx.openSetting({
                                    success: res => {
                                        if (res.authSetting["scope.writePhotosAlbum"]) {
                                            saveImage();
                                        } else failure();
                                    },
                                    fail: res => failure()
                                });
                            }
                        });
                    } else saveImage();
                },
                fail: res => {
                    wx.showModal({
                        title: "读记事",
                        content: "警告：无法读取权限获取信息！",
                        showCancel: false
                    });
                }
            });
          }else if (res.type === "change") this.imgCurrent = res.mp.detail.current;
      },
      //记事视频的操作
      getVideoInfo(res) {
          var saveVideo = () => {
              wx.showModal({
                  title: "读记事",
                  content: "是否保存当前视频到本地？",
                  success: res => {
                      if (res.confirm) {
                          wx.saveImageToPhotosAlbum({
                              filePath: this.video,
                              success: res => {
                                  wx.showToast({
                                      title: "保存视频成功！",
                                      image: "/static/images/success.png"
                                  });
                              },
                              fail: res => {
                                  wx.showToast({
                                      title: "保存视频失败！",
                                      image: "/static/images/error.png"
                                  });
                              }
                          });
                      }
                  }
              });
          }
          function failure() {
              wx.showModal({
                  title: "读记事",
                  content: "警告：没有保存到相册的权限，无法保存视频到本地！",
                  showCancel: false
              });
          }
          wx.getSetting({
              success: res => {
                  if (!res.authSetting["scope.writePhotosAlbum"]) {
                      wx.authorize({
                          scope: 'scope.writePhotosAlbum',
                          success: res => saveVideo(),
                          fail: res => {
                              wx.openSetting({
                                  success: res => {
                                      if (res.authSetting['scope.writePhotosAlbum']) {
                                          saveVideo();
                                      } else failure();
                                  },
                                  fail:res => failure()
                              });
                          }
                      });
                  } else saveVideo();
              },
              fail: res => {
                  wx.showModal({
                      title: "读记事",
                      content: "警告：无法读取权限获取信息！",
                      showCancel: false
                  });
              }
          });
      },
      //记事类型的快速跳转
      jumpToAnother(res) {
          if (res.type === "touchstart") {
              temp.anchor[2] = [res.clientY, new Date().getTime()];
          } else if (res.type === "touchend") {
              var moveDistance = (res.mp.changedTouches[0].pageY - temp.anchor[2][0]) * SWT;
              if (Math.abs(moveDistance) >= 187.5 && new Date().getTime() - temp.anchor[2][1] < 1000) {
                  delete temp.anchor[2];
                  var whichCanShow = []; //可查看的记事类型的队列
                  //向上述队列推入所有当前可以查看的记事类型的标签
                  if (this.text.content !== "") whichCanShow.push("text");
                  if (this.playback.length > 0) {
                      whichCanShow.push("record");
                      if ((temp.timerQueue || []).length > 0) {
                          innerAudioContext.stop();
                          for (let value of temp.timerQueue) clearTimeout(value);
                          this.playback.forEach(ele => ele.opacity = 1);
                          temp.timerQueue = [];
                      }
                  }
                  if (this.img.length > 0) whichCanShow.push("image");
                  if (this.video !== "") whichCanShow.push("video");
                  var index = whichCanShow.indexOf(this.sw);
                  if (moveDistance > 0) {
                      if (index + 1 < whichCanShow.length) { //判断下一种记事类型是否存在
                          this.sw = whichCanShow[index + 1];
                      } else this.backToOverview();
                  } else {
                      if (index - 1 >= 0) { //判断上一种记事类型是否存在
                          this.sw = whichCanShow[index - 1];
                      } else this.backToOverview();
                  }
              }
          }
      }

    },


}
</script>
