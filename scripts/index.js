$(function(){
  blog.parseArticleData();
  blog.printArticlesToHTML($('main'));
  blog.articles[0].getPublishedDaysPast();
});
