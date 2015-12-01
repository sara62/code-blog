var Blog = function(blogContainer)
{
  this.articles = [];
  this.rawData = [];
  this.container = {};
};
Blog.prototype.setBlogContainer = function(blogContainer){
  this.container = blogContainer;
};
Blog.prototype.parseArticleData = function()
{
  var articleContainer = this.container.find('article');
  var array = [];
  $.each(this.rawData,function(index,value){
    array[index] = new Article(value,articleContainer.clone());
  });
  this.articles = array;
};
Blog.prototype.printArticlesToHTML = function()
{
  var blogContainer = this.container;
  $(this.container).find('article').remove();
  $.each(this.articles,function(index,value){
    blogContainer.append($(value.toHTML()));
  });
};
var blog = new Blog();
/*
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
*/
