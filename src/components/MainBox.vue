<template>
  <div>
    <div style="padding-top: 100px; width: 90%; min-height: 680px; text-align: center; margin: auto;">
      <el-card shadow="always" style="width: 640px; min-height: 680px; text-align: center; margin: auto; background: rgba(255,255,255,0.6)">
        <el-row>
          <el-image :src="logo"></el-image>
        </el-row>
        <el-radio-group v-model="scaleRadio" style="height: 50px; width: 100%" @change="changeScale">
          <el-radio :label="2" style="width: 15%">2x</el-radio>
          <el-radio :label="3" style="width: 15%">3x</el-radio>
          <el-radio :label="4" style="width: 15%">4x</el-radio>
        </el-radio-group>
        <el-upload
          class="upload-demo"
          style="text-align: center; margin: auto"
          drag
          :data="uploadData"
          action="http://localhost:8081/upload"
          accept="image/png, image/jpeg"
          multiple
          :before-upload="handleBeforeUpload"
          :on-progress="handleProcess"
          :on-success="handleSuccess"
          :before-remove="handleBeforeRemove"
          :on-preview="handlePreview"
          >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，不超过300kb，且分辨率小于300*300</div>
        </el-upload>
      </el-card>
    </div>
    <el-dialog
      title="SAN"
      :visible.sync="dialogVisible"
      width="70%"
      :before-close="handleClose">
      <el-image :src="imageURL"></el-image>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>

export default {
  name: 'MainBox',
  data () {
    return {
      logo: require('../assets/logo.png'),
      loadingInstance: null,
      imageURL: null,
      fileList: [],
      dialogVisible: false,
      processNum: 0,
      scaleRadio: 2,
      uploadData: {
        scale: 2
      }
    }
  },
  created: function () {
    window.onbeforeunload = function (e) {
      e = e || window.event

      // 兼容IE8和Firefox 4之前的版本
      if (e) {
        e.returnValue = '关闭提示'
      }

      // Chrome, Safari, Firefox 4+, Opera 12+ , IE 9+
      return '关闭提示'
    }
    window.addEventListener('beforeunload', () => { this.deleteAllImage() })
  },
  mounted: function () {
    this.changeScale(2)
  },
  destroyed: function () {
    window.removeEventListener('beforeunload', () => { this.deleteAllImage() })
  },
  methods: {
    changeScale: function (integer) {
      this.scaleRadio = integer
      this.uploadData.scale = integer
    },
    handleBeforeUpload: function (file) {
      // 文件的类型，大小，长宽检测
      const isIMAGE = file.type === 'jpeg' || 'png'
      const isLt1M = file.size / 1024 / 300 < 1

      if (!isIMAGE) {
        this.$message.error('请上传png/jpg格式图片!')
      }
      if (!isLt1M) {
        this.$message.error('上传文件大小不能超过 300KB!')
      }
      const isSize = new Promise(function (resolve, reject) {
        let width = 300
        let height = 300
        let _URL = window.URL || window.webkitURL
        let img = new Image()
        img.onload = function () {
          let valid = img.width <= width && img.height <= height
          valid ? resolve() : reject(new Error(0))
        }
        img.src = _URL.createObjectURL(file)
      }).then(() => {
        return file
      }, () => {
        this.$message.error('上传的图片宽高必须小于300*300!')
        return Promise.reject(new Error(0))
      })
      return isIMAGE && isLt1M && isSize
    },
    handleProcess: function () {
      this.processNum += 1
      this.loadingInstance = this.$loading({
        lock: true,
        text: '图像处理中，请稍侯',
        background: 'rgba(255, 255, 255, 0.65)'
      })
    },
    handleSuccess: function (response, file, fileList) {
      this.processNum -= 1
      if (this.processNum === 0) {
        this.loadingInstance.close()
      }
      for (var i = 0; i < fileList.length; i++) {
        if (response.data.name === fileList[i].name) {
          if (response.code === 0) {
            fileList[i].url = response.data.url
            fileList[i].name += ' SRx' + this.scaleRadio
            fileList[i].scale = this.scaleRadio
            this.imageURL = response.data.url
            this.dialogVisible = true
          } else {
            this.$message.error(response.data.name + ': ' + response.msg)
            fileList.splice(i, 1)
          }
          this.fileList = fileList
          break
        }
      }
    },
    handleClose: function (done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
    },
    handleBeforeRemove: function (file) {
      // 上传文件时，若经过判断该文件不符合上传规定也会调用此钩子函数，下一行的判断为判断这是系统自动删除还是用户希望删除该文件
      if (file.status === 'success') {
        let postList = {'name': file.name, 'scale': file.scale}
        postList = this.qs.stringify(postList)
        return this.$confirm(`确定移除 ${file.name}？`).then(() => {
          this.$axios.post('/delete', postList)
            .then(response => {
              if (response.data.code === 0) {
                this.$message({
                  message: '删除成功',
                  type: 'success'
                })
              } else {
                this.$message.error('删除失败')
              }
            })
        })
      }
    },
    deleteAllImage: function () {
      for (var i = 0; i < this.fileList.length; i++) {
        let postList = {'name': this.fileList[i].name, 'scale': this.fileList[i].scale}
        postList = this.qs.stringify(postList)
        this.$axios.post('/delete', postList)
      }
    },
    handlePreview: function (file) {
      this.imageURL = file.url
      this.dialogVisible = true
    }
  }
}
</script>

<style scoped>

</style>
