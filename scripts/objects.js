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
Article.prototype.toHTML = function() {
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
Article.prototype.getPublishedDaysPast = function() {
  return Math.floor((this.currentDate.getTime() - this.publishedDate.getTime())/((3600*1000)*24));
};
/*
  The Blog Object
*/
var Blog = function() {
  this.articles = [];
  this.rawData = [];
  this.container = {};
  this.authors = [];
  this.categories = [];
  this.filterDOM = {};
  this.DOM = {};
};
Blog.prototype.setBlogContainer = function(blogContainer) {
  this.container = blogContainer;
};
Blog.prototype.parseFilterData = function(template) {
  var filterContainer = template;
  this.filterDOM = filterContainer.find('#article-filters');
  template.find('#article-filters').remove();
  return template;
};
Blog.prototype.setFilterData = function() {
  //Set Arrays for Filter Setup
  var utilities = new Utilities();
  array = [];
  $.each(this.articles,function(index){
    array[index] = this.author;
  });
  this.authors = utilities.uniqueArray(array);
  array = [];
  $.each(this.articles,function(index){
    array[index] = this.category;
  });
  this.categories = utilities.uniqueArray(array);
  //Now add the appropriate select and option elements to the filterDOM.
  var filters = this.filterDOM;
  var option = filters.find('.filter-option').clone();
  filters.find('.filter-option').remove();
  var authorFilter = filters.find('.filter').clone().attr('id','author-filter').attr('name','author-filter');
  var categoryFilter = filters.find('.filter').clone().attr('id','category-filter').attr('name','category-filter');
  var newOption = option.clone();
  newOption.text('All Authors');
  newOption.attr('value','All Authors');
  authorFilter.find('.filter-select').append(newOption);
  newOption = option.clone();
  newOption.text('All Categories');
  newOption.attr('value','All Categories');
  categoryFilter.find('.filter-select').append(newOption);
  filters.find('.filter').remove();
  filters.find('ul').append(authorFilter);
  filters.find('ul').append(categoryFilter);
  $.each(this.authors,function(index,value) {
    var newOption = option.clone();
    newOption.text(value);
    newOption.attr('value',value);
    filters.find('#author-filter .filter-select').append(newOption);
  });
  $.each(this.categories,function(index,value) {
    var newOption = option.clone();
    newOption.text(value);
    newOption.attr('value',value);
    filters.find('#category-filter .filter-select').append(newOption);
  });
  $('nav').on('change','#author-filter',function() {
    $('#category-filter .filter-select').val('All Categories');
    $('#articles article').show();
    var selection = $('#author-filter option:selected').attr('value');
    if (selection !== 'All Authors') {
      $('#articles article').each(function(){
        var articleAuthor = $(this).find('.article-author').text();
        if(articleAuthor!==selection)
        {
          $(this).hide();
        }
      });
    }
  });
  $('nav').on('change','#category-filter',function() {
    $('#author-filter .filter-select').val('All Authors');
    $('#articles article').show();
    var selection = $('#category-filter option:selected').attr('value');
    if (selection !== 'All Categories') {
      $('#articles article').each(function(){
        var articleCategory = $(this).find('.article-category span').text();
        articleCategory = articleCategory.slice(10);
        if(articleCategory!==selection)
        {
          $(this).hide();
        }
      });
    }
  });
};
Blog.prototype.resetFilters = function() {
  $('#articles article').show();
  $('#author-filter .filter-select').val('All Authors');
  $('#category-filter .filter-select').val('All Categories');
};
Blog.prototype.parseArticleData = function(template) {
  //Setup the article template after grabbing it's filter template from the full template.
  var articleContainer = this.parseFilterData(template);
  var array = [];
  $.each(this.rawData,function(index,value) {
    array[index] = new Article(value,articleContainer.clone(),index);
  });
  this.articles = array;
  var blogDOM = $('<div id="articles"></div>');
  $.each(this.articles,function(index,value){
    blogDOM.append($(value.toHTML()));
  });
  blogDOM.find('article p:not(:first-child)').hide();
  this.DOM = blogDOM;
  $(this.container).on('click','.read-more',function() {
    $(this).parent().find('.article-content p').fadeIn(1000);
    $(this).hide();
  });
  //Setup the blog's filters.
  this.setFilterData();
};
Blog.prototype.getFiltersDOM = function() {
  return this.filterDOM;
};
Blog.prototype.getDOM = function() {
  return this.DOM;
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
  this.DOM = $('<div class="page"></div>').append(pageTemplate);
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
    $(this.DOM).find('article').attr('id',(this.title + '-page'));
    $(this.DOM).find('.basic-title h2').text(this.title);
    $(this.DOM).find('.basic-content').html(this.content);
  } else if (this.type === 'Reference Page') {
    //For Reference Pages
    $(this.DOM).find('article').attr('id',(this.title + '-page'));
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
