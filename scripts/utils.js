/*
  The Article Object
*/
var Article = function(props,container,index){
  this.author = props.author;
  this.authorUrl = props.authorUrl;
  this.title = props.title;
  this.content = props.body;
  this.publishedOn = props.publishedOn;
  this.category = props.category;
  this.DOM = container;
  this.currentDate = new Date();
  this.publishedDate = new Date(this.publishedOn);
  this.id = index;
};
Article.prototype.toHTML = function()
{
  $(this.DOM).attr('id',('article-'+this.id));
  $(this.DOM).find('.article-title h2').text(this.title);
  $(this.DOM).find('.article-author a').attr('href',this.authorUrl).text(this.author);
  $(this.DOM).find('.article-content').html(this.content);
  $(this.DOM).find('.article-category span').text('Category: '+this.category);
  if(this.getPublishedDaysPast()==1) {
    $(this.DOM).find('.article-published-date span').first().text('Published yesterday, ');
  } else if(this.getPublishedDaysPast()==0) {
    $(this.DOM).find('.article-published-date span').first().text('Published today, ');
  } else if(this.getPublishedDaysPast()>1) {
    $(this.DOM).find('.article-published-date span').first().text('Published on ');
  } else if(this.getPublishedDaysPast()<0) {
    $(this.DOM).find('.article-published-date span').first().text('An article from the future, published on ');
  }
  $(this.DOM).find('.article-published-date span').first().append($('<time></time>').attr('datetime',this.publishedOn).text(this.publishedOn));
  if(this.getPublishedDaysPast()>1) {
    $(this.DOM).find('.article-published-date span').last().text(', '+this.getPublishedDaysPast()+' days ago...');
  } else {
    $(this.DOM).find('.article-published-date span').last().remove();
  }
  $(this.DOM).find('.read-more').attr('href',('#article-'+this.id));
  return this.DOM;
};
Article.prototype.getPublishedDaysPast = function()
{
  return Math.floor((this.currentDate.getTime() - this.publishedDate.getTime())/((3600*1000)*24));
};
/*
  The Blog Object
*/
var Blog = function() {
  this.articles = [];
  this.rawData = [];
  this.container = {};
  this.DOM = {};
};
Blog.prototype.setBlogContainer = function(blogContainer) {
  this.container = blogContainer;
};
Blog.prototype.parseArticleData = function(template) {
  var articleContainer = template;
  var array = [];
  $.each(this.rawData,function(index,value) {
    array[index] = new Article(value,articleContainer.clone(),index);
  });
  this.articles = array;

  this.DOM = $('<div id="articles"></div>');
  $('main').append(this.DOM);
  $.each(this.articles,function(index,value){
    $('main').find('#articles').append($(value.toHTML()));
  });
  alert($(this.DOM).toSource());
  $('main').append($(this.DOM));

};
Blog.prototype.getDOM = function() {
  return this.DOM;
};
Blog.prototype.showArticleExcerpts = function() {
  $(this.DOM).find('article p:not(:first-child)').hide();
  $('main').on('click','.read-more',function() {
    $(this).parent().find('.article-content p').fadeIn(1000);
    $(this).hide();
  });
};
/*
  The Site Object
*/
var Site = function(mainContainer) {
  this.container = mainContainer;
  this.templates = {};
};
Site.prototype.loadTemplates = function() {
  var array = [];
  var blogContainer = this.container;
  $(blogContainer).find('article').each(function() {
    var template = $(this).attr('id');
    array[template] = $(this).clone();
  });
  this.templates = array;
};
Site.prototype.removeArticles = function() {
  $(this.container).find('article').remove();
};
/*
  The Page Object
*/
var Page = function() {
  this.container = {};
  this.title = '';
  this.content = '';
  this.rawData = [];
  this.DOM = {};
  this.type = '';
  this.linkTitles = [];
  this.linkUrls = [];
};
Page.prototype.setPageContainer = function(pageContainer) {
  this.container = pageContainer;
};
Page.prototype.setPageTemplate = function(pageTemplate,pageType) {
  this.DOM = pageTemplate;
  this.type = pageType;
};
Page.prototype.parsePageData = function() {
  this.title = this.rawData[0]['title'];
  this.content = this.rawData[0]['content'];
  if(this.type === 'Reference Page')
  {
    this.linkTitles = this.rawData[0]['linkTitles'];
    this.linkUrls = this.rawData[0]['linkUrls'];
  }
  if(this.type === 'Basic Page') {
    //For Basic Pages
    $(this.DOM).attr('id',(this.title + '-page'));
    $(this.DOM).find('.basic-title h2').text(this.title);
    $(this.DOM).find('.basic-content').html(this.content);
  } else if (this.type === 'Reference Page') {
    //For Reference Pages
    $(this.DOM).attr('id',(this.title + '-page'));
    $(this.DOM).find('.reference-title h2').text(this.title);
    $(this.DOM).find('.reference-content').html(this.content);
    var linkItems = $(this.DOM).find('.link-item');
    var linkItem = $(this.DOM).find('.link-item').clone();
    var linkItemUrls = this.linkUrls;
    $.each(this.linkTitles,function(index,value) {
      var currentLinkItem = linkItem.clone();
      currentLinkItem.find('span').first().text(value + ': ');
      currentLinkItem.find('a').attr('href',linkItemUrls[index]).text(linkItemUrls[index]);
      $(linkItems).append(currentLinkItem);
    });
  }
};
Page.prototype.getDOM = function() {
  return this.DOM;
};
