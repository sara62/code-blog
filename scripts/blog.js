var blog = {};
blog.articles = [];
blog.rawData = [];
blog.parseArticleData = function()
{
  blog.rawData.forEach(function(element,index){
    blog.articles[index] = new Article(element);
  });
};
blog.printArticlesToHTML = function(container)
{
  var articleContainer = container;
  blog.articles.forEach(function(element){
    articleContainer.append(element.toHTML());
  });
};
