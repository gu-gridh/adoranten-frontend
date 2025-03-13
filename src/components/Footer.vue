<script setup>
</script>

<template>
  <footer id="footer">
    <div id="info">
        <a href="https://www.gu.se/digital-humaniora" target="_blank">GRIDH Home</a>
        <a href="https://github.com/gu-gridh/" target="_blank">GitHub repository</a>
        <div>Address: Box 100, 405 30 Gothenburg</div>
        <div>Telephone: +46 (0) 31-786 0000</div>
      </div>
    <div>
      <a href="https://dh.gu.se/">DH</a>
      <a href="https://www.gu.se/">GU</a>
    </div>
  </footer>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed&display=swap');

#footer {
  background-color: #222;
  color: #fff;
  padding: 15px;
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  font-family: Barlow Condensed,sans-serif;
  display: flex;
  justify-content: space-between;
  text-align: left;
}

#info {
  display: flex;
  flex-direction: column;
}

#info > div {
  margin-top: 8px;
}

a {
  color: #fff;
  text-decoration: none;
  margin-right: 25px;
}

a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  #footer {
    padding: 10px;
  }
}
</style>