<template>
    <view id="page" v-bind:style="{display:ifReady ? 'block' : 'none'}">

        <scroll-view id="background">
            <swiper v-bind:current="current" circular=true interval=30
             v-bind:autoplay="autoplay" @change="changeBackgroundImage"
             @animationfinish="changeBackgroundImage">
                <swiper-item v-for="item in bgiQueue" :key="item">
                    <img mode="aspectFill" v-bind:src="item"/>
                </swiper-item>
            </swiper>
        </scroll-view>

        <view id="mainFn" v-if="!useCamera">

            <view class="menu" v-if="noting === 'menu'">

                <view class="title">
                    摘要：
                    <view class="input">
                        <input v-bind:value="title" v-bind:placeholder="titleDefault" @focus="titleContent" @input="titleContent" @blur="titleContent"/>
                    </view>
                </view>

                <view class="selection">
                    <view class="text sel" @tap="getTextFn" @longpress="getTextFn" v-bind:style="{border:'9rpx solid ' + (text.content.length > 0 ? 'orange' : 'green')}">
                        <img src="/static/images/text.png">
                    </view>
                    <view class="record sel" @tap="getRecordFn" @longpress="getRecordFn" v-bind:style="{border:'9rpx solid ' + playbackStorageSign}">
                        <img src="/static/images/record.png">
                    </view>
                    <view class="photo sel" @tap="getImageFn" @longpress="getImageFn" v-bind:style="{border:'9rpx solid ' + imgStorageSign}">
                        <img src="/static/images/image.png">
                    </view>
                    <view class="video sel" @tap="getVideoFn" @longpress="getVideoFn" v-bind:style="{border:'9rpx solid ' + (video.length > 0 ? 'red' : 'green')}">
                        <img src="/static/images/video.png">
                    </view>
                    <view class="save_cancel sel" @tap="save_cancel">
                        <img v-bind:src="'/static/images/' + saveSign + '.png'"/>
                    </view>
                </view>

                <view class="bgiChange">
                    <view class="bgiChange_cp">
                        <img src="/static/images/bgiChange.png" v-bind:style="{left: 50 * bgiChange + '%'}" 
                        @touchstart="changeBackgroundImage" @touchmove="changeBackgroundImage"
                        @touchend="changeBackgroundImage">
                    </view>
                </view>

            </view>

            <scroll-view class="noting" v-if="noting !== 'menu'">

                <view class="exit">
                    <img v-bind:src="'/static/images/' + (noting || 'null') + '.png' " @tap="backToMenu"/>
                </view>

                <view class="creating">

                    <view class="text sel" v-if="noting === 'text'">

                        <view class="writing">
                            <textarea v-bind:value="text.content || ''" maxlength="none" v-bind:style="{fontSize: text.fontSize || '100%', 'font-weight': text.fontWeight || 'normal', color: text.fontColor || '#000'}" @focus="textContent" @input="textContent" @blur="textContent"></textarea>
                        </view>

                        <view class="font">
                            <picker mode="multiSelector" v-bind:value="fontIndex" v-bind:range="font" @tap="setFontStyle" @longpress="setFontStyle" @columnchange="setFontStyle" @cancel="setFontStyle">
                                <img src="/static/images/font-set.png"/>
                            </picker>
                        </view>
                        

                    </view>

                    <view class="record sel" v-if="noting === 'record'">

                        <view class="recording ele">
                            <view class="rec_component" v-bind:animation="rotating">
                                <view class="rec_pointer"></view>
                                <button disabled="true" v-bind:animation="breathing"
                                 @touchstart="startRecord" @touchend="stopRecord"></button>
                            </view>
                        </view>

                        <view class="playback ele" @tap="playbackFn">
                            <button v-bind:id="'rec_' + index" v-bind:src="item.path" v-for="(item, index) in playback" :key="index"
                             v-bind:style="{opacity:item.opacity}" @tap.stop="playbackFn" @longpress.stop="deleteRecord">
                             {{index + 1}}</button>
                        </view>

                    </view>

                    <view class="photo sel" v-if="noting === 'image'">
                        <swiper v-if="!reRender" v-bind:current="imgCurrent" circular="true"
                        indicator-dots="true" indicator-active-color="#fff" @animationfinish="setImgCurrent">
                            <swiper-item v-bind:id="'image_' + index" v-for="(item, index) in img" :key="index" @tap="previewImage" @longpress="save_deleteImage">
                                <img mode="aspectFit" v-bind:src="item.path">
                            </swiper-item>
                        </swiper>
                    </view>

                    <view class="video sel" v-if="noting === 'video'">
                        <video v-bind:src="video" @longpress="videoPreview"></video>
                    </view>
                    

                </view>

            </scroll-view>

        </view>

        <view id="cameraFn" v-if="useCamera">
            <camera v-bind:style="{display:!ifPreview ? 'block' : 'none'}" v-bind:flash="flash" v-bind:device-position="camSet">
                <cover-view class="top">
                    <cover-view class="goback" v-if="!shootNow" @tap="backToMenu">
                        <cover-image mode="widthFix" src="/static/images/goback.png"></cover-image>
                    </cover-view>
                    <cover-view class="camSet" v-if="!shootNow" @tap="changeCam">
                        <cover-image mode="widthFix" src="/static/images/camSet.png" v-bind:style="{opacity: camSign }"></cover-image>
                    </cover-view>
                    <cover-view class="flashSet" v-if="noting === 'photoTaking'" @tap="flashSet">
                        <cover-image mode="widthFix" v-bind:src="'/static/images/' + flash + '.png'"></cover-image>
                    </cover-view>
                    <cover-view class="shootSign" v-if="noting !== 'photoTaking'" v-bind:style="{opacity:shootSign}"></cover-view>
                    </cover-view>
                <cover-view class="bottom">
                    <cover-view class="preview component" v-if="noting === 'photoTaking'" @tap="preview">
                        <cover-image mode="widthFix" v-bind:src="imagePreview"></cover-image>
                    </cover-view>
                    <cover-view class="cameraSet component" @tap="cameraSet">
                        <cover-image mode="widthFix" v-bind:src="cameraSign"></cover-image>
                    </cover-view>
                    <cover-view class="changeMode component" v-if="!shootNow" @tap="changeMode">
                        <cover-image mode="widthFix" v-bind:src="modeChange"></cover-image>
                    </cover-view>
                    <cover-view class="qualitySet" v-if="noting === 'photoTaking'" @tap="setQuality">{{quality}}</cover-view>
                </cover-view>
            </camera>
            <view class="preview" v-bind:style="{display: ifPreview ? 'block' : 'none'}">
                <img v-bind:src="imagePreview"/>
            </view>
        </view>

    </view>
</template>

<style>
    #page {
    height: 100vh;
    width: 100vw;
    }
/* 背景图 */
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

/* 主功能区 */
    #mainFn {
    position: absolute;
    height: 100%;
    width: 100%;
    }
    /* 菜单栏 */
        .menu {
        box-sizing: border-box;
        position: absolute;
        top: 0;
        height: 100%;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        }
        /* 记事标题 */
            .menu .title {
                position: absolute;
                top: 0;
                height: 7%;
                width: 100%;
                box-sizing: border-box;
                display: flex;
                align-items: center;
                color: #cc0000;
                font-weight: bolder;
                text-indent: 0.5em;
            }
            .menu .title text {
                flex: none;
                height: 100%;
            }
            .menu .title .input {
                flex: 1;
                box-sizing: border-box;
                height: 100%;
                padding: 0 0.25em;
                border: 6rpx solid #cc0000;
                border-radius: 20rpx;
                text-indent: 0; 
                color: #000;
                font-weight: normal;
                background-color: rgba(255, 255, 255, 0.7);
            }
            .input input {
                height: 100%;
                width: 100%;
            }
        /* 记事类型选择区 & 保存/取消记事区 */
            .menu .selection {
                position: relative;
                height: 75vw;
                width: 75vw;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .menu .selection .sel {
                position: absolute;
                height: 37.5%;
                width: 37.5%;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .menu .selection .sel img {
                height: 100%;
                width: 100%;
            }
            .menu .selection .text {
                top: 0;
                right: 0;
            }
            .menu .selection .record {
                top: 0;
                left: 0;
            }
            .menu .selection .photo {
                bottom: 0;
                right: 0;
            }
            .menu .selection .video {
                bottom: 0;
                left: 0;
            }
        /* 背景图切换 */
            .menu .bgiChange {
                position: absolute;
                bottom: 0;
                left: 20%;
                height: 12.5%;
                width: 12.5vh;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .bgiChange .bgiChange_cp {
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

    /* 记事创建与记事预览区 */
        .noting {
            height: 100%;
            width: 100%;
        }
        /* 退出区 */
            .noting .exit {
                position: relative;
                height: 10%;
                width: 100%;
            }
            .noting .exit img {
                position: absolute;
                right: 15rpx;
                height: 100%;
                width: 10vh;
            }
        /* 创建与预览区 */
            .noting .creating {
                position: relative;
                box-sizing: border-box;
                height: 90%;
                width: 100%;
                background-color: rgba(255, 255, 255, 0.5);
            }
            .noting .creating .sel {
                box-sizing: border-box;
                height: 100%;
                width: 100%;
                border: 6rpx solid black;
            }
            /* 文本记事 */
                .noting .creating .text .writing {
                    box-sizing: border-box;
                    height: 85%;
                    width: 100%;
                    padding: 0 1%;
                    background-color: rgba(255, 255, 255, 0.5);
                }
                .noting .creating .text .writing textarea {
                    height: 100%;
                    width: 100%;
                    background: -webkit-gradient(linear, left top, left bottom, from(#000), color-stop(5%, rgba(255, 255, 255, 0)));
                    background-size: 100% 1em;
                }
                .noting .creating .text .font {
                    position: relative;
                    height: 15%;
                    width: 100%;
                }
                .noting .creating .text .font picker {
                    position: absolute;
                    right: 15rpx;
                    height: 100%;
                    width: 13.5vh;
                }
                .noting .creating .text .font picker img {
                    height: 13.5vh;
                    width: 100%;
                }
            /* 语音记事 */
                .noting .creating .record .ele {
                    position: relative;
                    box-sizing: border-box;
                    height: 50%;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .noting .creating .record .recording .rec_component {
                    position: absolute;
                    height: 275rpx;
                    width: 275rpx;
                    bottom: 0;
                    background-color: #06f;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .noting .creating .record .recording .rec_component .rec_pointer {
                    position: absolute;
                    top: 30rpx;
                    height: 125rpx;
                    width: 125rpx;
                    background-color: orangered;
                    transform: rotate(45deg);
                }
                .noting .creating .record .recording .rec_component button {
                    position: absolute;
                    height: 200rpx;
                    width: 200rpx;
                    border-radius: 50%;
                    background-color: #F5F5DC;
                }
                .noting .creating .record .playback button {
                    height: 125rpx;
                    line-height: 125rpx;
                    width: 125rpx;
                    text-align: center;
                    border-radius: 50%;
                }
            /* 图片记事 */
                .noting .creating .photo swiper {
                    height: 100%;
                    width: 100%;
                }
                .noting .creating .photo swiper swiper-item {
                    height: 100%;
                    width: 100%;
                }
                .noting .creating .photo swiper swiper-item image {
                    height: 100%;
                    width: 100%;
                }
            /* 视频记事 */
                .noting .creating .video {
                    height: 100%;
                    width: 100%;
                }
                .noting .creating .video video {
                    height: 100%;
                    width: 100%;
                }

/* 相机组件 */
      /* 相机组件 */
        #cameraFn {
            position: absolute;
            height: 100%;
            width: 100%;
        }
        /* 摄像区 */
            #cameraFn camera {
                height: 100%;
                width: 100%;
                background-color: #000;
            }
            /* 上部：退出组件、前后置摄像头切换、闪关灯开关 */
                #cameraFn camera .top {
                    position: absolute;
                    top: 0;
                    height: 150rpx;
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                }
                #cameraFn camera .top .goback {
                    position: absolute;
                    height: 150rpx;
                    left: 0;
                    width: 150rpx;
                }
                #cameraFn camera .top .camSet {
                    position: absolute;
                    height: 150rpx;
                    width: 150rpx;
                }
                #cameraFn camera .top .flashSet {
                    position: absolute;
                    right: 0;
                    height: 150rpx;
                    width: 150rpx;
                }
                #cameraFn camera .top .shootSign {
                    position: absolute;
                    right: 50rpx;
                    top: 50rpx;
                    height: 50rpx;
                    width: 50rpx;
                    background-color: #FF0000;
                    border-radius: 50rpx 50rpx 50rpx 50rpx;
                }
            /* 下部：预览窗口、主按钮、模式切换 */
                #cameraFn camera .bottom {
                    position: absolute;
                    bottom: 7.5%;
                    height: 20%;
                    width: 100%;
                }
                #cameraFn camera .bottom .component {
                    position: absolute;
                    top: 0;
                    margin: 0 50rpx;
                }
                #cameraFn camera .bottom .preview {
                    margin-top: 12.5rpx;
                    left: 7%;
                    height: 125rpx;
                    width: 125rpx;
                    background-color: #000;
                    border-radius: 125rpx 125rpx 125rpx 125rpx;
                }
                #cameraFn camera .bottom .cameraSet {
                    margin: 0 40%;
                    height: 150rpx;
                    width: 150rpx;
                    background-color: #fff;
                    border-radius: 150rpx 150rpx 150rpx 150rpx;
                }
                #cameraFn camera .bottom .changeMode {
                    right: 5%;
                    height: 150rpx;
                    width: 150rpx;
                }
                #cameraFn camera .bottom .qualitySet {
                    position: absolute;
                    top: 175rpx;
                    height: 2em;
                    width: 100%;
                    text-align: center;
                    font-weight: bold;
                }
        /* 图片预览区 */
            #cameraFn .preview {
                height: 100%;
                width: 100%;
            }
            .preview img {
                height: 100%;
                width: 100%;
            }

</style>

<script>

const SWT = 750 / wx.getSystemInfoSync().screenWidth;  //获取用户本机的相对像素比

//用于监测是否已开启相关权限的标识初始化
var getRecordAccess = true; //录音权限的标识，默认权限开启
var getCameraAccess = true; //相机权限的标识，默认权限开启
var getAlbumAccess = true; //存图到相册权限的标识，默认权限开启

//语音记事初始化
const recorderManager = wx.getRecorderManager(); //获取全局唯一的录音管理器 recorderManager
const innerAudioContext = wx.createInnerAudioContext(); //创建并返回内部audio上下文 innerAudioContext 对象

var temp;  //临时数据存储器

export default {


    data() {
      return {

        ifReady: false,

        current: wx.getStorageSync("bgiCurrent"),
        bgiQueue: wx.getStorageSync("bgiQueue"),
        autoplay: false,

        noting: "menu",
        bgiChange: 0,
        
        title: "",
        titleDefault: "记事标题",

        text: new Object(),
        font: [ //字体样式选择器相应选择项的提示序列
            ["超小号", "小号", "默认", "大号", "超大号"],
            ["轻盈", "默认", "粗壮"],
            ["默认", "中国红", "罗兰紫", "深空蓝", "森林绿", "巧克力棕"]
        ],

        playback: [],
        breathing: null,
        rotating: null,

        img: [],
        imgCurrent: 0,
        reRender: false,

        video: "",

        //相机组件功能初始化
        flash: "off", //闪光灯设置，默认关闭
        shootSign: 0, //录像进行时闪动标识
        camSet: "back",
        camSign: 1, //摄像头反转图标的透明度设置
        camChange: 0,
        ifPreview: false,
        shootNow: false, //录像进行时标识，录像未进行时为false
        quality: "Normal", //照片质量设定，默认为普通

      }
    },

    /* 原生生命周期函数--监听页面加载 */
    onLoad(res) {
        console.log("CreateNote onLoad");
        var bgiCurrent = wx.getStorageSync("bgiCurrent");
        if (this.current !== bgiCurrent) this.current = bgiCurrent;
        wx.getSetting({  //获取录音功能、相机功能和保存到相册功能的权限获取情况
            success: res => { //若能或取权限获取情况
                function failure(prop) { //建立权限获取失败函数
                    var content;
                    switch (prop) {
                        case "scope.record": {
                            getRecordAccess = false;
                            content = "未获取录音权限";
                            break;
                        };
                        case "scope.camera": {
                            getCameraAccess = false;
                            content = "未获取相机权限";
                            break;
                        };
                        case "scope.writePhotosAlbum": {
                            getAlbumAccess = false;
                            content = "将无法写入相册";
                            break;
                        };
                    }
                    wx.showToast({
                        title: content,
                        image: "/static/images/warning.png"
                    });
                }
                if (Object.keys(res.authSetting).length === 3) { //若相应权限都曾要求授权
                for (let prop in res.authSetting) {
                    if (!res.authSetting[prop]) { //若有相应权限没有授权
                        wx.authorize({ //弹出相应权限的授权提示框
                            scope: prop,
                            fail: res => wx.openSetting({ fail: res => failure(prop) })  //若授权失败，主动打开系统授权窗口
                        });
                    }
                }
                } else { //若有权限未曾提出授予
                var scopeQueue = ["scope.record", "scope.camera", "scope.writePhotosAlbum"];
                scopeQueue.forEach(ele => {
                    if (ele in res.authSetting === false) {
                        wx.authorize({  //弹出相应权限的授权提示框
                            scope: ele,
                            fail: res => wx.openSetting({ fail: res => failure(prop) })  //若授权失败，主动打开系统授权窗口
                        });
                    }
                });
                }
            },
            fail: res => {  //若无法获取录音功能、相机功能和保存到相册功能的权限获取情况
                //限制相应功能或组件的使用
                getRecordAccess = false;
                getCameraAccess = false;
                getAlbumAccess = false;
                wx.showModal({  //弹出权限获取情况无法读取的警告窗口
                    title: "写记事",
                    content: "警告：无法读取权限获取信息，录音、相机和写入相册功能将不可用！",
                    showCancel: false
                });
            }
        });
        if (wx.getStorageInfoSync().keys.indexOf("item_to_edit") !== -1) {
            var note = wx.getStorageSync("note")[wx.getStorageSync("item_to_edit")];
            this.title = note.title;
            this.text = note.text;
            this.playback = note.record.map(ele => {
                ele.opacity = 1;
                return ele;
            });
            this.img = note.image;
            this.video = note.video;
        } else {
            this.title = (function () {
                var dateFn = new Date();
                return ("记事 " +
                    dateFn.getFullYear() +
                    ((dateFn.getMonth() + 1).toString().length < 2 ?
                    "0" + (dateFn.getMonth() + 1) : dateFn.getMonth() + 1) +
                    (dateFn.getDate().toString().length < 2 ?
                    "0" + dateFn.getDate() : dateFn.getDate()) +
                    (dateFn.getHours().toString().length < 2 ?
                    "0" + dateFn.getHours() : dateFn.getHours()) +
                    (dateFn.getMinutes().toString().length < 2 ?
                    "0" + dateFn.getMinutes() : dateFn.getMinutes()) +
                    (dateFn.getSeconds().toString().length < 2 ?
                    "0" + dateFn.getSeconds() : dateFn.getSeconds())
                );
            })();
            this.text = {
                content: "",
                fontSize: "100%",
                fontWeight: "normal",
                fontColor: "#000",
            }
            if (this.playback.length > 0) this.playback = [];
            if (this.img.length > 0) this.img = [];
            if (this.video !== "") this.video = "";
        }
        
        if (this.flash !== "off") this.flash = "off";
        if (this.camSet !== "back") this.camSet = "back";
        if (this.breathing !== null) this.breathing = null;
        if (this.rotating !== null) this.rotating = null;

        temp = {  //初始化临时数据存储器

            bgiChangeComplete: true

        };

        //预注册录音开始事件
        recorderManager.onStart(res => {
            if (temp.ifEndRecording) { //当录音开始进程偷跑时截停
                temp.ifEndRecording = false;
                recorderManager.stop();
                recorderManager.onStop();
            } else { //当录音正常进行时录音
                temp.recordNow = true;
                if (temp.ifShowToast) {
                    wx.hideToast();
                    temp.ifShowToast = false;
                }
                this.breathingEffection("start");
                this.progressbar("start");
                //注册录音结束事件
                recorderManager.onStop(res => {
                    temp.recordNow = false;
                    this.breathingEffection("stop");
                    this.progressbar("stop");
                    if (res.duration >= 120000) {
                        wx.showToast({
                            title: "录音限时两分钟",
                            image: "/static/images/warning.png",
                            mask: true
                        });
                    }
                    if (res.duration > 500) {
                        this.playback.push({
                            path: res.tempFilePath,
                            duration: res.duration,
                            opacity: 1
                        });
                        wx.showToast({
                            title: "第" + this.playback.length + "条语音记事",
                            icon: "none",
                            success(res) {
                                temp.ifShowToast = true;
                                setTimeout(() => temp.ifShowToast = false, 1450);
                            }
                        });
                        wx.vibrateShort();
                    } else {
                        wx.showToast({
                            title: "语音录制过短",
                            image: "/static/images/warning.png",
                            mask: true
                        });
                    }
                });
            }
        });

        //预热录音记事录音按钮的启停动画效果
        this.breathingEffection("start");
        this.progressbar("start");
        this.$nextTick(() => {
            this.breathingEffection("stop");
            this.progressbar("stop");
        });

    },

    /* 原生生命周期函数--监听页面初次渲染完成 */
    onReady(res) {
        console.log("CreateNote onReady");
        this.ifReady = true;
    },

    /* 原生生命周期函数--监听页面隐藏 */
    onHide: res => console.log("CreateNote onHide"),

    /* 原生生命周期函数--监听页面卸载 */
    onUnload(res) {
        this.ifReady = false;
    },


    computed: {

        fontIndex: function () {
            return [
                ["50%", "75%", "100%", "150%", "200%"].indexOf(this.text.fontSize),
                ["lighter", "normal", "bolder"].indexOf(this.text.fontWeight),
                ["#000" , "#F00", "#8A2BE2", "#00BFFF", "#228B22", "#D2691E"].indexOf(this.text.fontColor)
            ]
        },

        playbackStorageSign: function () {
            switch(this.playback.length) {
                case 0: { return "green" }break;
                case 5: { return "red" }break;
                default: { return "orange" }break;
            }
        },

        imgStorageSign: function () {
            switch(this.img.length) {
                case 0: { return "green" }break;
                case 5: { return "red" }break;
                default: { return "orange" }break;
            }
        },

        saveSign: function () {
            let condition = [this.text.content, this.playback, this.img, this.video];
            if (this.title.length > 0 && condition.some(ele => ele.length > 0)) {
                return "save";
            }else return "cancel";
        },

        useCamera: function () {
            return /Taking/.test(this.noting);
        },
        
        imagePreview: function () {
            if (this.img.length > 0) {
                return this.img[this.img.length - 1].path;
            }else return "";
        },

        cameraSign: function() {
            if (this.useCamera) {
                if (/photo/.test(this.noting)) {
                    return "/static/images/photo.png";
                }else if (/video/.test(this.noting)) {
                    return "/static/images/shoot.png";
                }
            }else return "/static/images/null.png";
        },

        modeChange: function () {
            if (this.useCamera) {
                if (/photo/.test(this.noting)) {
                    return "/static/images/shoot.png";
                }else if (/video/.test(this.noting)) {
                    return "/static/images/photo.png";
                }
            }else return "/static/images/null.png";
        }

    },


    methods: {

        /* 记事标题 */
        //记事标题的创建
        titleContent(res) {
            if (res.type === "input") {
                this.title = res.mp.detail.value;
                if (this.title.length > 0 && this.title.trim().length === 0) {
                    this.title = "";
                    wx.showToast({
                        title: "行首不能为空格",
                        image: "/static/images/warning.png"
                    });
                }else if (this.title[0] === " " && /\S+/.test(this.title)) {
                    let buffer = this.title;
                    while(buffer[0] === " ") buffer = buffer.substring(1);
                    this.title = buffer;
                    wx.showToast({
                        title: "行首不能为空格",
                        image: "/static/images/warning.png"
                    });
                }
            }else if (res.type === "blur") {          
                if (this.title.length === 0) {
                    if (this.text.content.length > 0) {
                        this.title = this.text.content;
                    }else {
                        this.title = (() => {
                            var dateFn = new Date();
                            let content = "";
                            if (this.playback.length > 0) content += "R";
                            if (this.img.length > 0) content += "I";
                            if (this.video.length > 0) content += "V";
                            if (content === "") content = "记事";
                            return (content + " " +
                                dateFn.getFullYear() +
                                ((dateFn.getMonth() + 1).toString().length < 2 ?
                                "0" + (dateFn.getMonth() + 1) : dateFn.getMonth() + 1) +
                                (dateFn.getDate().toString().length < 2 ?
                                "0" + dateFn.getDate() : dateFn.getDate()) +
                                (dateFn.getHours().toString().length < 2 ?
                                "0" + dateFn.getHours() : dateFn.getHours()) +
                                (dateFn.getMinutes().toString().length < 2 ?
                                "0" + dateFn.getMinutes() : dateFn.getMinutes()) +
                                (dateFn.getSeconds().toString().length < 2 ?
                                "0" + dateFn.getSeconds() : dateFn.getSeconds())
                            );
                        })()
                    }
                    wx.showToast({
                        title: "标题已自动填充",
                        image: "/static/images/warning.png"
                    });
                }
                this.title = this.title.replace(/\s+(?![\S\s]+)/, ""); //去除标题末尾多余的空格
                if (this.title.length > 20) {
                    this.title = this.title.substring(0, 20);
                    wx.showToast({
                        title: "标题最长二十字",
                        image: "/static/images/warning.png"
                    });
                }
            }
        },

        /* 文本记事 */
        //文本记事的创建与清除
        getTextFn(res) {
            if (res.type === "tap") {
                this.noting = "text";
            }else if (res.type === "longpress" && this.text.content !== "") {
                wx.showModal({
                    title: "文本记事",
                    content: "是否清空文本记事？",
                    success: res => {
                        if (res.confirm) {
                            this.text = {
                                content: "",
                                fontSize: "100%",
                                fontWeight: "normal",
                                fontColor: "#000",
                                fontIndex: [2, 1, 0]
                            }
                        }
                    }
                });
            }
        },
        //文本记事的撰写
        textContent(res) {
            if (res.type === "input") {
                this.text.content = res.mp.detail.value;
            }else if (res.type === "blur") {
                if (res.mp.detail.value.length > 0 && !res.mp.detail.value.trim()) {
                    this.text.content = "";
                    wx.showToast({
                        title: "不能全输入空格",
                        image: "/static/images/warning.png"
                    });
                }
                this.text.content = this.text.content.replace(/\s+(?![\S\s]+)/, ""); //去除文本末尾多余的空格
            }
        },
        //字体样式的修改
        setFontStyle(res) {
            switch(res.type) {
                case "tap": {
                    temp.fontStyle = new Object();
                    //获取当前字体样式的设定信息
                    temp.text = JSON.stringify(this.text);
                    console.log("修改前的字体样式信息如下：\n",
                                "字体大小：" + this.text.fontSize + "\n",
                                "字体粗细：" + this.text.fontWeight + "\n",
                                "字体颜色：" + this.text.fontColor);
                }break;
                case "columnchange": {
                    switch (res.mp.detail.column) {
                        case 0: { //字体大小的设定；
                            switch (res.mp.detail.value) {
                                case 0: { this.text.fontSize = "50%" }; break;
                                case 1: { this.text.fontSize = "75%" }; break;
                                case 2: { this.text.fontSize = "100%" }; break;
                                case 3: { this.text.fontSize = "150%" }; break;
                                case 4: { this.text.fontSize = "200%" }; break;
                            }
                        }; break;
                        case 1: { //字体粗细的设定
                            switch (res.mp.detail.value) {
                                case 0: { this.text.fontWeight = "lighter" }; break;
                                case 1: { this.text.fontWeight = "normal" }; break;
                                case 2: { this.text.fontWeight = "bolder" }; break;
                            }
                        }; break;
                        case 2: { //字体颜色的设定
                            switch (res.mp.detail.value) {
                                case 0: { this.text.fontColor = "#000"; }; break;
                                case 1: { this.text.fontColor = "#F00"; }; break;
                                case 2: { this.text.fontColor = "#8A2BE2"; }; break;
                                case 3: { this.text.fontColor = "#00BFFF"; }; break;
                                case 4: { this.text.fontColor = "#228B22"; }; break;
                                case 5: { this.text.fontColor = "#D2691E"; }; break;
                            }
                        }; break;
                    }
                }break;
                case "cancel": {
                    this.text = JSON.parse(temp.text);
                }break;
                case "longpress": {
                    if (JSON.stringify(this.text) !== temp.text) {
                        wx.showModal({
                            title: "写记事",
                            content: "是否重设字体到默认样式？",
                            success: res => {
                                if (res.confirm) {
                                    this.text.fontSize = "100%";
                                    this.text.fontWeight = "normal";
                                    this.text.fontColor = "#000";
                                }
                            }
                        });
                    }
                }break;
            }
        },

        /* 语音记事 */
        //语音记事的创建与清除
        getRecordFn(res) {
            if (res.type === "tap") {
                this.noting = "record";
            } else if (res.type === "longpress" && this.playback.length > 0) {
                wx.showModal({
                    title: "语音记事",
                    content: "是否清空语音记事？",
                    success: res => res.confirm ? this.playback = [] : false
                });
            }
        },
        //开始语音记事
        startRecord(res) {
            if (this.playback.length < 5) {
                temp.ifEndRecording = false;
                recorderManager.start({
                    duration: 120000,
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    encodeBitRate: 192000,
                    format: "aac",
                    frameSize: 50
                });
            } else {
                wx.showToast({
                    title: "语音记事已满",
                    image: "/static/images/warning.png"
                });
            }
        },
        //结束语音记事
        stopRecord(res) {
            temp.ifEndRecording = true;
            if (!temp.recordNow && this.playback.length < 5) {
                wx.showToast({
                    title: "录制语音请长按",
                    image: "/static/images/warning.png",
                    mask: true
                });
            } else recorderManager.stop();
        },
        //语音记事的预览
        playbackFn(res) {
            if (res.currentTarget.id) {
                var index = res.currentTarget.id.match(/\d+/g)[0];
                innerAudioContext.autoplay = true;
                innerAudioContext.src = this.playback[index].path;
                if ("playbackSign" in temp) {
                    clearTimeout(temp.playbackSign);
                    this.playback.forEach(ele => ele.opacity = 1);
                    delete temp.playbackSign;
                }
                (function playing (flag, duration) {
                    if (this.playback[index].opacity < 0.3) flag = true;
                    if (this.playback[index].opacity > 1) flag = false;
                    if (flag) {
                        this.playback[index].opacity += 0.025;
                    } else this.playback[index].opacity -= 0.025;
                    temp.playbackSign = setTimeout(() => {
                        duration -= 35;
                        if (duration > 0) {
                            playing.apply(this, [flag, duration]);
                        } else this.playback[index].opacity = 1;
                    }, 35);
                }).apply(this, [false, this.playback[index].duration]);
            }else if ("playbackSign" in temp) {
                clearTimeout(temp.playbackSign);
                delete temp.playbackSign;
                this.playback.forEach(ele => ele.opacity !== 1 ? ele.opacity = 1 : false);
                innerAudioContext.stop();
            }
        },
        //语音记事的删除
        deleteRecord(res) {
            var index = res.currentTarget.id.match(/\d+/g)[0];
            wx.showModal({
            title: "语音记事",
            content: "是否删除本条语音？",
                success: res => {
                    if (res.confirm) {
                        wx.showLoading({
                            title: "正在删除本语音",
                            mask: true
                        });
                        (function deleteRecord () {
                            this.playback[index].opacity -= 0.1;
                            setTimeout(() => {
                                wx.hideLoading();
                                if (this.playback[index].opacity <= 0) {
                                    this.playback.splice(index, 1);
                                }else deleteRecord.call(this);
                            }, 50);
                        }).call(this);
                    }
                }
            });
        },
        //呼吸效果的启停
        breathingEffection(tag) {
            if (tag === "start") {
                var breathing = wx.createAnimation({ duration: 120000 });
                for (let i = 0; i < 120; i++) {
                    breathing.backgroundColor("#FF0000").step({ duration: 1000 })
                             .backgroundColor("#F5F5DC").step({ duration: 1000 });
                }
                this.breathing = breathing.export();
            } else if (tag === "stop") {
                this.reRender = true;
                this.$nextTick(() => {
                    this.reRender = false;
                    this.breathing = wx.createAnimation({ duration: 0 })
                                       .backgroundColor("#F5F5DC").step({ duration: 0 })
                                       .export();
                });
            }
        },
        //进度指示的启停
        progressbar(tag) {
            switch(tag) {
                case "start": { var val = [120000, 360]; }break;
                case "stop":{  var val = [1000, 0]; }break;
                default: return;
            }
            this.rotating = wx.createAnimation({ duration: val[0] })
                              .rotate(val[1]).step({ duration: val[0] })
                              .export();
        },

        /* 图片记事 */
        //图片记事的创建与清除
        getImageFn(res) {
            if (res.type === "tap") {
                var selection = sel => {
                    switch(sel) {
                        case 0: {
                            this.noting = "photoTaking";
                            this.camSet = "back";
                            this.flash = "off";
                            this.qualitySet = "Normal";
                        }break;
                        case 1: {
                            wx.chooseImage({
                                count: 5 - this.img.length,
                                sourceType: ["album"],
                                success: res => {
                                    res.tempFilePaths.forEach(ele => {
                                        this.img.push({ path: ele });
                                    });
                                    this.imgCurrent = this.img.length - 1;
                                    this.noting = "image";
                                }
                            });
                        }break;
                        case 2: {
                            this.imgCurrent = 0;
                            this.noting = "image";
                        }break;
                    }
                }
                if (getCameraAccess) {
                    if (this.img.length < 5) {
                        wx.showActionSheet({
                            itemList: (() => {
                                if (this.img.length > 0) {
                                    return ["拍照", "从本地获取图片", "预览图片"];
                                }else return ["拍照", "从本地获取图片"];
                            })(),
                            success: res => selection(res.tapIndex)
                        });
                    }else selection(2);
                }else {
                    if (this.img.length === 0) {
                        selection(1);
                    }else if (this.img.length < 5) {
                        wx.showActionSheet({
                            itemList: ["从本地获取图片", "预览图片"],
                            success: res => selection(res.tapIndex + 1)
                        });
                    }else selection(2);
                }
            }else if (res.type === "longpress" && this.img.length > 0) {
                wx.showModal({
                    title: "图片记事",
                    content: "是否清空图片记事？",
                    success: res => {
                        if (res.confirm) {
                            this.img = [];
                            this.imgCurrent = 0;
                        }
                    }
                });
            }
        },
        //图片记事的预览
        previewImage(res) {
            var index = res.currentTarget.id.match(/\d+/g)[0];
            wx.previewImage({ urls: [this.img[index].path] });
        },
        //图片记事的保存到本地与删除
        save_deleteImage(res) {
            var index = res.currentTarget.id.match(/\d+/g)[0];
            wx.showActionSheet({
                itemList: ["保存本张图片到本地", "删除本张图片"],
                success: res => {
                    if (res.tapIndex === 0) {
                        wx.saveImageToPhotosAlbum({
                            filePath: this.img[index].path,
                            success: res => {
                                wx.showToast({
                                    title: "保存操作成功！",
                                    image: "/static/images/success.png",
                                    mask: true
                                });
                            },
                            fail: res => {
                                wx.showToast({
                                    title: "保存操作失败！",
                                    image: "/static/images/error.png",
                                    mask: true
                                });
                            }
                        });
                    }else {
                        this.reRender = true;
                        if (this.imgCurrent > 0) this.imgCurrent -= 1;
                        this.img.splice(index, 1);
                        if (this.img.length === 0) this.noting = "menu";
                        this.reRender = false;
                    }
                }
            });
        },
        //当前图片展示滑块索引的同步
        setImgCurrent(res) {
            this.imgCurrent = res.mp.detail.current;
        },

        /* 视频记事 */
        //视频记事的创建与清除
        getVideoFn(res) {
            if (res.type === "tap") {
                var selectVideo = () => {
                    wx.chooseVideo({
                        sourceType: ["album"],
                        success: res => {
                            this.video = res.tempFilePath;
                            wx.showModal({
                                title: "视频记事",
                                content: "是否即刻预览视频？",
                                success: res => res.confirm ? this.noting = "video" : false
                            });
                        }
                    });
                }
                if (this.video.length === 0) {
                    if (getCameraAccess) {
                        wx.showActionSheet({
                        itemList: ["录像", "从本地获取视频"],
                        success: res => {
                            if (res.tapIndex === 0) {
                                this.camSet = "back";
                                this.noting = "videoTaking";
                            }else selectVideo();
                        }
                        });
                    }else selectVideo();
                }else this.noting = "video";
            }else if (res.type === "longpress" && this.video !== "") {
                wx.showModal({
                    title: "视频记事",
                    content: "是否清空视频记事？",
                    success: res => res.confirm ? this.video = "" : false
                });
            }
        },
        //视频记事的预览与删除
        videoPreview(res) {
            wx.showActionSheet({
                itemList: ["保存视频到本地", "删除视频"],
                success: res => {
                    if (!res.tapIndex) {
                        wx.createVideoContext(this.video).pause();
                        wx.saveVideoToPhotosAlbum({
                            filePath: this.video,
                            success: res => {
                                wx.showToast({
                                    title: "保存操作成功！",
                                    image: "/static/images/succes.png",
                                    mask: true
                                });
                            },
                            fail: res => {
                                wx.showToast({
                                    title: "保存操作失败！",
                                    image: "/static/images/error.png",
                                    mask: true
                                });
                            }
                        });
                    } else {
                        wx.showModal({
                            title: "视频记事",
                            content: "是否删除本条视频？",
                            success: res => {
                                if (res.confirm) {
                                    this.video = "";
                                    wx.showToast({
                                        title: "删除成功！",
                                        image: "/static/images/success.png",
                                        mask: true,
                                        success: res => setTimeout(() => this.noting = "menu", 1500)
                                    });
                                }
                            }
                        });
                    }
                }
            });
        },

        /* 菜单栏的返回 */
        backToMenu(res) {
            setTimeout(() => {
                if ("playbackSign" in temp) {
                    clearTimeout(temp.playbackSign);
                    delete temp.playbackSign;
                    this.playback.forEach(ele => ele.opacity !== 1 ? ele.opacity = 1 : false);
                    innerAudioContext.stop();
                }
                if (this.imgCurrent !== 0) this.mgCurrent = 0;
                this.noting = "menu";
            }, Math.random() * 10);
        },

        /* 背景图的切换 */
        changeBackgroundImage(res) {
            if (res.type === "touchstart") {
                temp.anchor = res.clientX;
            }else if (res.type === "touchmove" && temp.bgiChangeComplete) {
                var moveDistance = res.clientX - temp.anchor;
                if (Math.abs(moveDistance) >= 37.5) {
                    if (moveDistance > 0) {
                        this.bgiChange = 1;
                    }else this.bgiChange = -1;
                }else this.bgiChange = moveDistance / 37.5;
            }else if (res.type === "touchend") {
                if (Math.abs(this.bgiChange) === 1) temp.bgiChangeComplete = false;
                switch(this.bgiChange) {
                    case 1: {
                        if (this.current >= this.bgiQueue.length - 1) {
                            this.autoplay = true;
                        }else this.current += 1;
                    }break;
                    case -1: {
                        if (this.current <= 0) {
                            this.current = this.bgiQueue.length - 1;
                        }else this.current -= 1;
                    }break;
                }
                if (this.bgiChange !== 0) this.bgiChange = 0;
            }else if (res.type === "change") {
                if (this.autoplay) {
                    this.current = 0;
                    this.autoplay = false;
                }
                wx.setStorageSync("bgiCurrent", res.mp.detail.current);
            }else if (res.type === "animationfinish") temp.bgiChangeComplete = true;
        },

        /* 当前记事的保存与取消 */
        save_cancel(res) {
            wx.showModal({
                title: "写记事",
                content: "是否" + (this.saveSign === "save" ? "保存" : "取消") + "当前记事？",
                success: res => {
                    function redirecting () {  //页面重定向函数及删除记录需要修改的记事的序号的缓存
                        wx.removeStorageSync("item_to_edit");
                        if (wx.getStorageSync("note").length > 0) {
                            wx.redirectTo({ url: "../ShowNote/main" });
                        }else wx.redirectTo({ url: "../Home/main" });
                    }
                    if (this.saveSign === "save" && res.confirm) {
                        wx.showLoading({
                            title: "正在保存记事！",
                            mask: true
                        });
                        var restToSave = this.playback.length + this.img.length + 1;
                        var save_jump = () => {
                            var note = wx.getStorageSync("note");
                            var id = wx.getStorageSync("item_to_edit");
                            if (!id && id !== 0) id = note.length;
                            var item = {
                                title: this.title,
                                text: this.text,
                                record: this.playback.map(ele => {
                                    delete ele.index;
                                    delete ele.opacity;
                                    return ele;
                                }),
                                image: this.img.map(ele => {
                                    delete ele.index;
                                    return ele;
                                }),
                                video: this.video
                            }
                            note[id] = item;
                            wx.setStorageSync("note", note);
                            wx.hideLoading();
                            wx.showToast({
                                title: "记事保存成功！",
                                image: "/static/images/success.png",
                                mask: true,
                                success: setTimeout(() => redirecting(), 1250)
                            });
                        }
                        for (let prop in this) {
                            if (["playback", "img", "video"].indexOf(prop) !== -1) {
                                if (this[prop] instanceof Array) {
                                    this[prop].forEach((ele, index) => {
                                        wx.saveFile({
                                            tempFilePath: ele.path,
                                            success: res => "savedFilePath" in res ? this[prop][index].path = res.savedFilePath : false,
                                            complete: res => {
                                                restToSave -= 1;
                                                if (restToSave === 0) save_jump();
                                            }
                                        });
                                    });
                                }else {
                                    wx.saveFile({
                                        tempFilePath: this.video,
                                        success: res => "savedFilePath" in res ? this.video = res.savedFilePath : false,
                                        complete: res => {
                                            restToSave -= 1;
                                            if (restToSave === 0) save_jump();
                                        }
                                    });
                                }
                            }
                        }
                    }else if (this.saveSign === "save" && !res.confirm) {
                        redirecting();
                    }else if (this.saveSign === "cancel" && res.confirm) {
                        let condition = [this.text.content === "",
                                         this.playback.length === 0,
                                         this.img.length === 0,
                                         this.video === ""].every(ele => ele === true);
                        let noteIndex = parseInt(wx.getStorageSync("item_to_edit"));
                        if (Number.isInteger(noteIndex) && condition) {
                            wx.showModal({
                                title: "写记事",
                                content: "当前记事已空，是否彻底删除当前记事？",
                                success(res) {
                                    if (res.confirm) {
                                        var storage = wx.getStorageSync("note");
                                        storage.splice(noteIndex, 1);
                                        wx.setStorageSync("note", storage);
                                        wx.showToast({
                                            title: "记事删除成功！",
                                            image: "/static/images/success.png",
                                            mask: true,
                                            success: res => setTimeout(() => redirecting(), 1250)
                                        });
                                    }else redirecting();
                                }
                            });
                        }else redirecting();
                    }
                }
            });
        },

        /* 相机组件 */
        //摄像头前后置的切换
        changeCam(res) {
            switch(this.camSet) {
                case "back": { this.camSet = "front"; }break;
                case "front": { this.camSet = "back"; }break;
            }
            var camChange = tag => {
                tag -= 1;
                this.camSign = 1 - this.camSign;
                if (tag > 0) setTimeout(() => camChange(tag), 500);
            }
            camChange(2);
        },
        //闪关灯的开启与关闭
        flashSet(res) {
            switch(this.flash) {
                case "on": { this.flash = "off" }break;
                case "off": { this.flash = "on" }break;
            }
        },
        //图片的预览
        preview(res) {
            if (this.img.length > 0) {
                let imgQueue = [];
                this.img.forEach(ele => imgQueue.push(ele.path));
                wx.previewImage({
                    urls: imgQueue,
                    current: this.img[this.img.length - 1].path
                });
            }else {
                wx.showToast({
                    title: "图片记事为空",
                    image: "/static/images/warning.png"
                });
            }
        },
        //主按钮：拍照与录像
        cameraSet(res) {
            const camera = wx.createCameraContext();
            switch(this.noting) {
                case "photoTaking": {
                    camera.takePhoto({
                        quality: this.quality.toLowerCase(),
                        success: res => setImmediate(() => {
                            innerAudioContext.autoplay = true;
                            innerAudioContext.src = "/static/audio/shutter.mp3";
                            this.img.push({
                                index: this.img.length,
                                path: res.tempImagePath
                            });
                            wx.showToast({
                                title: "第" + this.img.length + "张图片记事",
                                icon: "none",
                                duration: 500,
                                mask: this.img.length === 5
                            });
                            this.ifPreview = true;
                            setTimeout(() => {
                                this.ifPreview = false;
                                if (this.img.length === 5) {
                                    this.imgCurrent = 4;
                                    this.noting = "image";
                                }
                            }, 1000);
                        }),
                        fail: res => setImmediate(() => {
                            wx.showToast({
                                title: "图片记事失败",
                                image: "/static/images/warning.png"
                            });
                        })
                    });
                }break;
                case "videoTaking": {
                    this.shootNow = !this.shootNow;
                    if (this.shootNow) {
                        wx.showLoading({
                            title: "开始视频记事",
                            mask: true
                        });
                        camera.startRecord({
                            success: res => setImmediate(() => {
                                innerAudioContext.autoplay = true;
                                innerAudioContext.src = "/static/audio/tick.mp3";
                                wx.vibrateShort();
                                (function shooting () {
                                    if (this.shootNow) {
                                        this.shootSign = 1 - this.shootSign;
                                        temp.shootingSign = setTimeout(() => shooting.call(this), 500);
                                    }
                                }).call(this);
                            }),
                            fai: res => setImmediate(() => {
                                wx.showToast({
                                    title: "录像启动失败",
                                    image: "/static/images/warning.png"
                                });
                            }),
                            complete: res => wx.hideLoading()
                        });
                    }else {
                        clearTimeout(temp.shootingSign);
                        if (this.shootSign === 1) this.shootSign = 0;
                        wx.showLoading({
                            title: "正在生成视频！",
                            mask: true
                        });
                        camera.stopRecord({
                            success: res => setImmediate(() => {
                                this.video = res.tempVideoPath;
                                innerAudioContext.autoplay = true;
                                innerAudioContext.src = "/static/audio/tick.mp3";
                                wx.vibrateShort();
                                wx.showToast({
                                    title: "视频记事成功！",
                                    image: "/static/images/success.png",
                                    mask: true,
                                    success: setTimeout(() => this.noting = "video", 1000)
                                });
                            }),
                            fail: res => setImmediate(() => {
                                wx.showToast({
                                    title: "视频记事失败",
                                    image: "/static/images/warning.png"
                                });
                            }),
                            complete: res => wx.hideLoading()
                        });
                    }
                }break;
            }
        },
        //摄像模式的切换
        changeMode(res) {
            if (/photo/.test(this.noting) && this.video.length === 0) {
                this.noting = "videoTaking"
            }else if (/video/.test(this.noting) && this.img.length < 5) {
                this.noting = "photoTaking";
            }else {
                wx.showToast({
                    title: (/photo/.test(this.noting) ? "视频" : "图片") + "记事已满",
                    image: "/static/images/warning.png"
                });
            }
        },
        //拍照质量的设定
        setQuality(res) {
            switch(this.quality) {
                case "Low": { this.quality = "Normal"; }break;
                case "Normal": { this.quality = "High"; }break;
                case "High": { this.quality = "Low"; }break;
            }
        }

    }


}
</script>