<template>
  <div class="app" >
    <div class="background"></div>
    <div class="context">
      <router-view/>
    </div>
  </div>

</template>

<script>

export default {
  name: 'App'
}
</script>

<style>
.app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  /*color: #2c3e50;*/

}
.background{
  width: 99.9% !important;
  height: 58em;
  background: url('./assets/bg/bg1.jpg') no-repeat fixed;
  background-size: cover;
  filter: blur(5px);
}
.context{
  position: absolute;
  top: 0px;
  width: 99.9% !important;
  height: 100%;
}

</style>
