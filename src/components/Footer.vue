<template>
  <footer id="footer">
    <div id="developer-info">
      <div class="links-stack">
        <a class="site-link link"
          href=""
          target="_blank">GitHub
          repositories and development</a>
        <a class="site-link link" href=""
          target="_blank">Database and API documentation</a>
      </div>
      <!-- <div class="links-stack border-style">
        <a class="site-link link" href=""
          target="_blank">Dataset documentation</a>
      </div> -->
      <div class="links-stack border-style extra">
        <a class="site-link link" href=""
          target="_blank">Project team</a>
        <a class="site-link link" href="" target="_blank">Feedback form</a>
      </div>
    </div>
    <div class="partners">
      <a href="https://dh.gu.se/">
        <div class="link GRIDHLogo" id="">GU / GRIDH</div>
      </a>
    </div>
  </footer>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed&display=swap');

#footer {
  background-color: var(--theme-6);
  color: var(--theme-8);
  padding: 15px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  text-align: left;
}

#developer-info {
  display: flex;
  align-items: flex-end;
  margin-left: 35px;
  margin-top: 15px;
  font-size: 1.5em;
  line-height: 1.4;
  font-weight: 200;
}

.links-stack {
  margin-right: 20px;
}

.links-stack a {
  display: block;
}

.border-style {
  border-width: 0 0 0 0.5px;
  border-color: white;
  border-style: dashed;
  padding-left: 20px;
  padding-right: 10px;
}

.download-section a {
  display: inline;
}

.download-section {
  display: inline-flex;
  align-items: center;
}

.download-link {
  background: url("https://data.dh.gu.se/ui-icons/download_white_circle.png");
  background-size: 18px;
  background-position: 0px 50%;
  background-repeat: no-repeat;
  padding-left: 25px;
  margin-left: 0px;
}

.site-link {
  background: url("https://data.dh.gu.se/ui-icons/arrow_link_white_circle.png");
  background-size: 18px;
  background-position: 0px 50%;
  background-repeat: no-repeat;
  padding-left: 25px;
  font-size: 18px;
}

.partners {
  margin-left: auto;
}

.link {
  color: white;
}

.link:visited {
  color: white;
}

.link:hover {
  opacity: 0.8;
}

.GRIDHLogo {
  float: right;
  margin-top: 30px;
  width: auto;
  height: auto;
  text-align: left;
  font-weight: 100;
  font-style: normal;
  font-size: 30px;
  line-height: 0.8;
  padding: 0px 40px 5px 30px;
  vertical-align: middle;
}

#info>div {
  margin-top: 8px;
}

a {
  color: var(--theme-8);
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