import Vue from 'vue';
import App from './ShowNote';

const app = new Vue(App);
app.$mount();

export default {
    config: {
        navigationBarTitleText: "MultiNote 读记事"
    }
}