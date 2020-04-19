<template>
  <div class="mt-upload">
    <div class="mt-upload-custom-button">
      <input
        type="file"
        :multiple="multiple"
        @change="changeFile"
        class="mt-upload-input"
        ref="files"
        :style="style"
      />
      <div class="mt-upload-button"  :style="style">
          <slot></slot>
      </div>
    </div>
    <ul class="mt-upload-preview-list">
      <transition-group name="list" tag="div">
        <li
          v-for="(item,index) in fileList"
          @mouseenter="showDeleteIndex = index"
          @mouseleave="showDeleteIndex=-1"
          :key="item.url"
          class="list-cell"
        >
          <div
            class="list-cell-top"
            :class="{'list-style-picture':listStyle==='picture','list-style-text':listStyle==='text','list-style-card': listStyle==='card'}"
          >
            <div class="list-cell-left">
              <div class="img-cell" v-if="listStyle==='picture'">
                <img :src="item.url" :alt="item.name" />
              </div>
              <div class="text-img" v-if="listStyle==='text'">
                <img src="./images/file.png" />
              </div>
              <span style="margin-left:20px">{{item.name}}</span>
            </div>
            <div class="list-cell-right">
              <div class="deleteItem" v-if="showDeleteIndex == index" @click="deleteImg(index)">x</div>
              <transition name="list">
                <div class="uploadSuccess" v-if="uploadedArr.indexOf(index)!==-1">
                  <img src="./images/success.png" width="30px" v-if="success" />
                  <img src="./images/error.png" width="30px" v-if="!success" />
                </div>
              </transition>
            </div>
          </div>
          <div class="list-cell-bottom">
            <div class="upload-progress" ref="upload-progress"></div>
          </div>
        </li>
      </transition-group>
    </ul>
    <div class="mt-upload-slot">
      <slot></slot>
    </div>
  </div>
</template>
<script>
import './$message'
export default {
  name: 'osx-upload',
  props: {
    onChange: {
      type: Function
    },
    onRemove: {
      type: Function
    },
    onPreview: {
      type: Function
    },
    onProgress: {
      type: Function
    },
    onExceed: {
      type: Function
    },
    onSuccess: {
      type: Function
    },
    onFail: {
      type: Function
    },
    multiple: {
      type: Boolean,
      default: false
    },
    circle: {
      type: Boolean,
      default: false
    },
    action: {
      type: String
    },
    limit: {
      type: Number,
      default: 0
    },
    params: {
      type: Object,
      default: function () {
        return {}
      }
    },
    // 要缓存的参数
    cache: {
      type: Object,
      default: function () {
        return {}
      }
    },
    listStyle: {
      type: String,
      default: 'text'
    },
    // 上传的方式 同步还是异步
    uploadWay: {
      type: String,
      default: 'async'
    },
    maxSize: {
      type: Number,
      default: 10
    },
    buttonType: {
      type: String,
      default: 'default'
    }
  },
  data () {
    return {
      fileList: [],
      showDeleteIndex: -1,
      uploadedArr: [],
      success: true,
      style: {}
    }
  },
  mounted () {
    const styles = {
      default: {
        background: 'white'
      },
      primary: {
        background: '#3da0ff',
        color: 'white'
      },
      danger: {
        background: 'rgb(242, 128, 128)'
      }
    }
    console.log('buttonType发生变化', this.buttonType)
    // circle
    let buttonStyle = {}
    if (this.circle) {
      buttonStyle = {
        width: '50px',
        height: '50px',
        borderRadius: '25px',
        border: 'none',
        fontSize: '12px',
        lineHeight: '50px'
      }
    }
    this.style = { ...styles[this.buttonType], ...buttonStyle }
  },
  methods: {
    changeFile (ev) {
      const files = ev.target.files
      if (this.limit !== 0 && files.length > this.limit) {
        this.$message.error('上传的文件个数不能超过' + this.limit + '张')
        return
      }
      const fileList = []
      for (let i = 0; i < files.length; i++) {
        const file = ev.target.files[i]
        console.log(file.size)
        if (file.size > this.maxSize * 1024 * 1024) {
          this.$message.error('上传的文件不能超过' + this.maxSize + '兆')
          this.$refs.files.value = ''
          return
        }
        const url = window.URL.createObjectURL(file)
        const fileObj = {
          url,
          name: file.name,
          file
        }
        fileList.push(fileObj)
        this.onChange(file, fileList)
      }
      this.fileList = fileList
    },
    deleteImg (index) {
      console.log(index)
      this.fileList.splice(index, 1)
    },
    clearFiles () {
      this.fileList = []
      // 清空上次input元素选择的元素，避免重新选择相同元素的时候，无法触发change函数
      this.$refs.files.value = ''
    },
    /*
     *@description 上传文件
     */
    async uploadFiles () {
      for (let i = 0; i < this.fileList.length; i++) {
        if (this.uploadWay === 'sync') {
          await new Promise((resolve, reject) => {
            this.ajaxMethod(resolve, reject, i)
          })
        } else {
          this.ajaxMethod(
            () => {
              // console.log("上传成功");
              // this.onSuccess(this.fileList[i],this.fileList);
            },
            () => {
              console.log('上传失败')
            },
            i
          )
        }
      }
    },
    ajaxMethod (resolve, reject, i) {
      const uploadBars = this.$refs['upload-progress']
      const _this = this
      const xhr = new XMLHttpRequest()
      xhr.open('post', _this.action)
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          _this.success = true
          _this.onSuccess()
          resolve()
        }
        if (xhr.readyState === 4 && xhr.status >= 500) {
          // _this.onFail(_this.fileList[i],_this.fileList)
          _this.$message.error('上传失败')
          _this.success = false
          reject()
        }
      }
      xhr.upload.onprogress = function (ev) {
        if (ev.lengthComputable && !_this.failed) {
          const loaded = event.loaded
          const total = event.total
          const complete = ((loaded / total) * 100).toFixed(1)
          const progress = uploadBars[i]
          progress.innerHTML = Math.round(complete) + '%'
          progress.style.width = complete + '%'
          _this.onProgress()
        }
      }
      // 上传完成
      xhr.upload.onloadend = function () {
        console.log('上传结束', _this.success)
        _this.uploadedArr.push(i)
      }
      // 上传出错
      xhr.upload.onerror = function () {
        console.log('上传失败----------')
      }
      // 开始上传
      xhr.upload.onloadstart = function () {
        console.log('开始上传')
      }
      // 上传超时
      xhr.upload.ontimeout = function () {
        console.log('上传超时')
      }
      xhr.upload.onload = function () {
        console.log('加载中')
      }
      const fd = new FormData()
      fd.append('file', _this.fileList[i].file)
      if (typeof this.params === 'object') {
        fd.append('params', JSON.stringify(_this.params))
      } else {
        fd.append('params', _this.params)
      }
      xhr.send(fd)
    }
  }
}
</script>
<style>
.mt-upload {
  padding: 20px;
  box-sizing: border-box;
}

.mt-upload-custom-button {
  /* width: 200px;
    height: 100px;
    background: red; */
  position: relative;
}

.mt-upload-input {
  width: 80px;
  height: 50px;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
}

.mt-upload-button {
  padding: 0;
  margin: 0;
  height: 30px;
  line-height: 30px;
  width: 80px;
  background-color: white;
  border: 1px solid lightgray;
  color: gray;
  text-align: center;
  font-size: 12px;
}

.mt-upload-preview-list,
.mt-upload-preview-list > div {
  width: 100%;
  height: auto;
}

.list-cell {
  width: 100%;
  border: 1px solid lightgray;
  margin-top: 20px;
  border-radius: 10px;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.list-cell-top,
.list-style-picture {
  height: 120px;
  width: 100%;
  display: flex;
  flex-direction: row;
}
.list-style-text {
  width: 100%;
  height: 30px;
}
.list-cell-bottom {
  width: 100%;
  height: 20px;
  background-color: white;
}
.upload-progress {
  width: 0%;
  height: 5px;
  background-color: lightblue;
  font-size: 12px;
}
.list-cell-left,
.list-cell-right {
  width: 70%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: hidden;
  font-size: 12px;
}

.list-cell-right {
  width: 30%;
  position: relative;
  display: flex;
  justify-content: flex-end;
}

.deleteItem {
  position: relative;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid lightgray;
  color: gray;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  top: -30px;
}

.img-cell {
  width: 90px;
  height: 90px;
  overflow: hidden;
  border-radius: 5px;
}

.img-cell > img {
  height: 100%;
  width: auto;
}
.text-img {
  width: 30px;
  height: 30px;
  line-height: 30px;
}
.text-img > img {
  width: 100%;
  height: auto;
}
.list-enter-active,
.list-leave-active {
  transition: all 0.6s;
}

.list-enter,
.list-leave-to

/* .list-leave-active for below version 2.1.8 */
 {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
