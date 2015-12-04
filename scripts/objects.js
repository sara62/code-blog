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
var Blog = function(blogName,blogContainer,blogData,blogTemplate) {
  this.articles = [];
  this.rawData = blogData;
  this.container = blogContainer;
  this.authors = [];
  this.categories = [];
  //Note the .filterDOM property is changed into a jQuery object after this object is instantiated.  This occurs at the bottom of the object's setFilterData() method.
  this.filterDOM = {};
  this.DOM = {};
  this.template = blogTemplate;
  this.name = blogName;
  this.generalType = 'blog';
  this.parseArticleData(this.template);
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
  filters.find('#author-filter').on('change',function() {
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
  filters.find('#category-filter').on('change',function() {
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
  this.filtersDOM = filters;
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
Blog.prototype.showContent = function(duration) {
  this.resetFilters();
  this.filterDOM.show(duration);
  $(this.DOM).find('article p:not(:first-child)').hide();
  $(this.DOM).find('.read-more').show();
  $(this.DOM).show(duration);
};
Blog.prototype.hideContent = function(duration) {
  this.filtersDOM.hide(duration);
  $(this.DOM).hide(duration);
};
Blog.prototype.fadeInContent = function(duration) {
  this.resetFilters();
  this.filterDOM.fadeIn(duration);
  $(this.DOM).find('article p:not(:first-child)').hide();
  $(this.DOM).find('.read-more').show();
  $(this.DOM).fadeIn(duration);
};
Blog.prototype.fadeOutContent = function(duration) {
  this.filtersDOM.fadeOut(duration);
  $(this.DOM).fadeOut(duration);
};
/*
  The Page Object
*/
var Page = function(pageName,pageContainer,pageData,pageTemplate,pageType) {
  this.container = pageContainer;
  this.title = '';
  this.content = '';
  this.rawData = pageData;
  this.DOM = {};
  this.type = pageType;
  this.linkTitles = [];
  this.linkUrls = [];
  this.template = pageTemplate;
  this.name = pageName;
  this.generalType = 'page';
  this.setPageTemplate(this.template,this.type);
  this.parsePageData();
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
Page.prototype.showContent = function(duration) {
  $(this.DOM).show(duration);
};
Page.prototype.hideContent = function(duration) {
  $(this.DOM).hide(duration);
};
Page.prototype.fadeInContent = function(duration) {
  $(this.DOM).fadeIn(duration);
};
Page.prototype.fadeOutContent = function(duration) {
  $(this.DOM).fadeOut(duration);
};
/*
  The Site Object
*/
var Site = function(mainContainer,titleContainer) {
  this.container = mainContainer;
  this.titleContainer = titleContainer;
  this.rawSocialData = [];
  this.templates = {};
  this.pages = [];
  this.loadTemplates();
  this.removeArticles();
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
Site.prototype.setContent = function(pagesArray,socialDataArray) {
  this.rawSocialData = socialDataArray;
  this.pages = pagesArray;
  this.addPages();
};
Site.prototype.addPages = function() {
  var nav = new Navigation($('#navigation'),this.pages,this.rawSocialData,this.titleContainer,250,0);
  $.each(this.pages,function(index,value) {
    this.container.append(value.DOM);
    value.hideContent(0);
  });
};
/*
  The Navigation Object
*/
var Navigation = function(container,sitePages,siteSocialData,siteTitle,showDuration,hideDuration) {
  this.$container = container;
  this.$siteTitle = siteTitle;
  this.sitePages = sitePages;
  this.rawSocialData = siteSocialData;
  this.$mobileContainer = {};
  this.$desktopContainer = {};
  this.setupMenus(showDuration,hideDuration);
};
Navigation.prototype.setupMenus = function() {
  this.$mobileContainer = this.$container.find('#mobile-menu').clone();
  this.$container.find('#mobile-menu').remove();
  this.$desktopContainer = this.$container.find('#desktop-menu').clone();
  this.$container.find('#desktop-menu').remove();
  //this.setupMobileMenu(this.$mobileContainer);
  this.setupDesktopMenu(this.$desktopContainer);
};
Navigation.prototype.setupMobileMenu = function(container) {
  this.$container = container;
  this.$navContainer = this.container.find('#mobile-nav');
  this.$navContainer.hide();
  this.$container.on('click','.hamburger-menu',function() {
    //this.$navContainer.toggle();
  });
};
Navigation.prototype.setupDesktopMenu = function(container) {
  var $desktopMenu = this.$desktopContainer;
  var $linkItem = $desktopMenu.find('.site-menu .nav-link-item').first().clone();
  $desktopMenu.find('.site-menu .nav-link-item').remove();
  $.each(this.sitePages,function(index,value) {
    var $link = $linkItem.clone();
    if (value.generalType === 'blog') {
      $link.attr('data-nav',value.name).find('a').attr('href',('#' + value.name + '-filter')).text(value.name.replace(/\w\S*/g,function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}));
    } else {
      $link.attr('data-nav',value.name).find('a').attr('href',('#' + value.name)).text(value.name.replace(/\w\S*/g,function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}));
    }
    $desktopMenu.find('.site-menu ul').append($link);
  });
  $.each(this.rawSocialData,function(index,value) {
    var $link = $linkItem.clone();
    $link = $link.find('a');
    $link.attr('href',value.url).attr('target','_blank');
    var $image = $('<img width="50" height="42" />').attr('alt',('My ' + value.title)).attr('src',value.srcUrl).attr('class','icon octocat');
    $link.append($image);
    $desktopMenu.find('.site-menu').append('<div></div>').append($link);
  });
  $.each(this.sitePages,function(index,value) {
    if(value.generalType === 'blog') {
      $desktopMenu.find('nav').append(value.filterDOM);
    }
  });
  this.$container.append(this.$desktopContainer);
  this.setupMenuActions(this.$desktopContainer,500,500);
};
Navigation.prototype.setupMenuActions = function($menuContainer,fadeInDuration,fadeOutDuration) {
  var pages = this.sitePages;
  this.$siteTitle.on('click',function() {
    $.each(pages,function(index,value) {
      value.fadeOutContent(fadeOutDuration);
    });
  });
  $menuContainer.find('.site-menu .nav-link-item').each(function() {
    $(this).on('click',function(){
      var page = $(this).data('nav');
      $.each(pages,function(index,value) {
        if (page === value.name) {
          value.fadeInContent(fadeInDuration);
        } else {
          value.hideContent(0);
        }
      });
    });
  });
};
