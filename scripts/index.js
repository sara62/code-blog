$(function(){
  blog.setBlogContainer($('main'));
  blog.parseArticleData();
  blog.printArticlesToHTML();
  //blog.printArticlesToHTML($('main'));
  //blog.articles[0].getPublishedDaysPast();
});
