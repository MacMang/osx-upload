# OSX 系列组件 

# osx-upload 上传组件

## 参数说明

参数|作用
--|--
ref|通过ref获取元素
multiple|多选
params| body上传的参数
action | 上传的地址
limit | 限制文件的个数
max-size | 文件最大容量，1 表示1M
upload-way| 上传的方式，aync:异步，sync:同步
list-style | 文件排列的方式
button-type | 上传的按钮的类型 default,primary,danger
circle | 圆形按钮

## 用例
1. 在main.js中注册组件
```html
import OSXUpload from 'osx-upload'
Vue.use(OSXUpload)
```
```html
<template>
  <div class="hello">
    <osx-upload
      ref="upload"
      :on-change="changeFile"
      :on-remove="removeFile"
      :on-preview="previewFile"
      :on-progress="progress"
      :on-exceed="exceed"
      :on-success="success"
      :on-fail="failed"
      :maxSize="5"
      button-type='primary'
      multiple
      circle
      :params="{locatedId:1110}"
      action="http://localhost:3003/upload"
      upload-way="async"
      list-style="text"
      :limit="3"
    >
    <!-- 此处插入任意元素  -->
      上传
    </osx-upload>
    <button @click="upload">提交</button>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  methods: {
    clear () {
      this.$refs.upload.clearFiles()
    },
    upload () {
      this.$refs.upload.uploadFiles()
    },
    changeFile (file, fileList) {
      console.log(file, fileList)
    },
    removeFile (file, fileList) {},
    previewFile (file) {},
    progress (event, file, fileList) {},
    exceed (fileList) {},
    success (file, files) {
      console.log('上传成功', file, files)
    },
    failed (file, files) {
      console.log('上传失败', file, files)
    }
  }
}
</script>

<style scoped>

</style>

```