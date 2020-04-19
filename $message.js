import Vue from 'vue'
Vue.prototype.$message = {
  createBox: function () {
    const box = document.getElementById('messageBox')
    if (box) {
      box.parentNode.removeChild(box)
    }
    const newbox = document.createElement('div')
    newbox.id = 'messageBox'
    newbox.style.cssText = `
      width:200px;
      height:50px;
      position: fixed;
      top:20px;
      left:45%;
      display:block;
      opacity: 0;
      transition: all 0.5s;
      transform:translateY(-50px);
      display:flex;
      justify-content:center;
      align-items:center;
      font-size:13px;
    `
    return newbox
  },
  trans: function (box) {
    let timmer = null
    timmer = setTimeout(() => {
      box.style.transform = 'translateY(0)'
      box.style.opacity = 1
      clearTimeout(timmer)
      timmer = setTimeout(() => {
        box.style.transform = 'translateY(-100px)'
        box.style.opacity = 0
        clearTimeout(timmer)
      }, 3000)
    }, 300)
  },
  error: function (message) {
    const errorBox = this.createBox()
    errorBox.style.background = '#fef0f0'
    errorBox.style.color = 'LightCoral'
    errorBox.innerText = message
    document.body.appendChild(errorBox)
    this.trans(errorBox)
  },
  success: function (message) {
    const success = this.createBox()
    success.style.background = '#f0f9eb'
    success.style.color = 'green'
    success.innerText = message
    document.body.appendChild(success)
    this.trans(success)
  }
}
