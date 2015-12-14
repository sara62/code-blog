$(function(){
  var site = new Site('CODE_BLOG',{'links':[{title:'github',url:'https://github.com/jhm90/',srcUrl:'images/icons/Octocat.png',width:'50',height:'42',imgClass:'octocat'}]},'data/content0/');
  setInterval(function() {
    site.contentData = site.update();
  },5000);
  setInterval(function() {
    site.setCurrentPage();
  },10);
});
