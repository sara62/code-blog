/* The Site Object */
var Site = function(siteTitle,contentDirectoryPath) {
  this.model(siteTitle,contentDirectoryPath);
  this.view();
  this.controller();
  this.router();
};
Site.prototype.model = function(siteTitle,contentDirectoryPath) {
  this.title = siteTitle;
  this.renderedOnce = false;
  this.container = $('main');
  this.ajax = new AjaxHandler();
  this.templates = new Templates(this.ajax);
  this.contentURL = contentDirectoryPath + 'content.json';
  this.socialURL = contentDirectoryPath + 'social.json';
  this.versionURL = contentDirectoryPath + 'version.txt';
  this.socialDataLoaded = false;
  this.contentDataLoaded = false;
  this.versionDataLoaded = false;
  this.templatesLoaded = false;
  if (localStorage.getItem('contentDataVersion') === null) {
    this.contentDataVersion = this.ajax.getData(this.versionURL,false);
    localStorage.setItem('contentDataVersion',this.contentDataVersion);
  } else {
    this.contentDataVersion = localStorage.getItem('contentDataVersion');
  }
  if (this.ajax.checkForContentUpdate(this.contentDataVersion,this.versionURL)) {
    this.contentData = this.ajax.getJSON(this.contentURL,false);
    this.socialData = this.ajax.getJSON(this.socialURL,false);
    this.contentDataVersion = this.ajax.getData(this.versionURL,false);
    localStorage.setItem('contentData',JSON.stringify(this.contentData));
    localStorage.setItem('socialData',JSON.stringify(this.socialData));
    localStorage.setItem('contentDataVersion',this.contentDataVersion);
  } else {
    if (localStorage.getItem('contentData') === null) {
      this.contentData = this.ajax.getJSON(this.contentURL,false);
      localStorage.setItem('contentData',JSON.stringify(this.contentData));
    } else {
      this.contentData = JSON.parse(localStorage.getItem('contentData'));
    }
    if (localStorage.getItem('socialData') === null) {
      this.socialData = this.ajax.getJSON(this.socialURL,false);
      localStorage.setItem('socialData',JSON.stringify(this.socialData));
    } else {
      this.socialData = JSON.parse(localStorage.getItem('socialData'));
    }
  }
  this.getCurrentPage();
  this.pages = [];
};
Site.prototype.view = function() {
  $('#site-title a').text(this.title);
  document.title = this.title;
  this.navigation = new Navigation(this.socialData,this.templates);
  for (i = 0; i < this.contentData.pages.length; i++) {
    var counter = i;
    var page = new Page(this,this.contentData.pages[i]);
    i = counter;
  }
  this.renderedOnce = true;
};
Site.prototype.controller = function() {
  var site = this;
  window.setInterval(function() {
    if (site.renderedOnce) {
      if (site.ajax.checkForContentUpdate(site.contentDataVersion,site.versionURL)) {
        site.contentData = site.ajax.getJSON(site.contentURL,false);
        site.socialData = site.ajax.getJSON(site.socialURL,false);
        site.contentDataVersion = site.ajax.getData(site.versionURL,false);
        localStorage.setItem('contentData',JSON.stringify(site.contentData));
        localStorage.setItem('socialData',JSON.stringify(site.socialData));
        localStorage.setItem('contentDataVersion',site.contentDataVersion);
        site.navigation.updateSocialLinks(site.socialData);
        var newPages = [];
        for (i = 0; i < site.contentData.pages.length; i++) {
          var counter = i;
          var pageHasBeenMade = false;
          var pageIndex = '';
          for (j = 0; j < site.pages.length; j++) {
            if (site.pages[j].pageId.toString() === site.contentData.pages[i].id.toString()) {
              pageHasBeenMade = true;
              pageIndex = j;
            }
          }
          if (pageHasBeenMade) {
            site.pages[pageIndex].generatePage(site.contentData.pages[i]);
            newPages.push(site.pages[pageIndex]);
          } else {
            var page = new Page(site,site.contentData.pages[i]);
            newPages.push(page);
          }
          i = counter;
        }
        site.pages = newPages;
      }
    }
  },5000);
  window.setInterval(function() {
    site.currentPage = window.location.href;
    var hashId = site.currentPage.lastIndexOf('#');
    if (hashId === -1) {
      window.location.href = window.location.href + '#';
      hashId = site.currentPage.lastIndexOf('#');
    }
    site.currentPage = site.currentPage.substring((hashId+1),site.currentPage.length);
    localStorage.setItem('currentPage',site.currentPage);
  },10);
};
Site.prototype.router = function() {
  page('/',this.changePage);
  page.start();
};
Site.prototype.changePage = function() {
  var hashIndex = window.location.href.indexOf('#');
  if (hashIndex === -1) {
    window.location.href = window.location.href + '#';
    $(document).scrollTop(0);
    $('main').children().hide();
    $('.filters').hide();
  } else {
    if ((hashIndex + 1) === window.location.href.length) {
      $(document).scrollTop(0);
      $('main').children().hide();
      $('.filters').hide();
    } else {
      var pageTitle = window.location.href.substring(hashIndex,window.location.href.length);
      var subPageTitle = '';
      if (pageTitle.indexOf('-') > -1) {
        subPageTitle = pageTitle.substring((pageTitle.indexOf('-') + 1),pageTitle.length);
        pageTitle = pageTitle.substring(0,pageTitle.indexOf('-'));
      }
      $('main').children().hide();
      if ($((pageTitle + '-container')).length) {
        if (subPageTitle === '') {
          var $articles = $((pageTitle + '-container'));
          $articles.find('article .article-content :not(:first-child)').hide();
          $articles.find('.read-more').show();
          $articles.find('article').show();
          $articles.show();
        } else {
          var $articles = $((pageTitle + '-container'));
          $articles.find('article .article-content :not(:first-child)').hide();
          $articles.find('.read-more').show();
          $articles.find('article').show();
          $articles.show();
          var $article = $((pageTitle + '-' + subPageTitle));
          $article.find('*').each(function(index,value) {
            $(value).show();
          });
          $article.find('.read-more').hide();
        }
        $('.filters').hide();
        $((pageTitle + ' .filters')).show();
        $((pageTitle + ' .author-filter .filter-select')).val('All Authors');
        $((pageTitle + ' .category-filter .filter-select')).val('All Categories');
      } else {
        $('.filters').hide();
      }
      $(pageTitle).show();
      if (subPageTitle !== '') {
        var $article = $((pageTitle + '-' + subPageTitle));
        $(document).scrollTop($article.offset().top);
      } else {
        $(document).scrollTop($(pageTitle).offset().top);
      }
    }
  }
  if ($('#mobile-menu').css('width') !== '0px') {
    $('#mobile-menu').find('.hamburger-menu').rotate({duration:500,angle: 90,animateTo:0});
    $('#mobile-menu').css('width','0px');
    var menuOffScreen = (-1 * ($('#mobile-menu').find('.site-menu').width())) - 5;
    $('#mobile-menu').find('.site-menu').animate({left: menuOffScreen}, 500, function() {});
  }
};
Site.prototype.setCurrentPage = function() {
  this.currentPage = window.location.href;
  var hashId = this.currentPage.lastIndexOf('#');
  if (hashId === -1) {
    window.location.href = window.location.href + '#';
    hashId = this.currentPage.lastIndexOf('#');
  }
  this.currentPage = this.currentPage.substring((hashId+1),this.currentPage.length);
  localStorage.setItem('currentPage',this.currentPage);
};
Site.prototype.getCurrentPage = function() {
  this.currentPage = localStorage.getItem('currentPage');
  if (this.currentPage === null) {
    this.setCurrentPage();
  }
  return this.currentPage;
};
/* The Navigation Object */
var Navigation = function(socialData,siteTemplates) {
  this.model(siteTemplates);
  this.view(socialData);
  this.controller();
};
Navigation.prototype.model = function(templates) {
  this.pages = [];
  this.templates = templates;
};
Navigation.prototype.view = function(socialData) {
  $('#desktop-menu .site-menu ul').children().remove();
  $('#desktop-menu .social ul').children().remove();
  $('#mobile-menu .site-menu ul').children().remove();
  this.addSocialLinks(socialData);
};
Navigation.prototype.controller = function() {
  var menuOffScreen = (-1 * ($('#mobile-menu').find('.site-menu').width())) - 5;
  $('#navigation').on('click','.hamburger-menu',function(event) {
    event.preventDefault();
    if ($('#mobile-menu').css('width') !== '0px') {
      $('#mobile-menu').find('.hamburger-menu').rotate({duration:500,angle: 90,animateTo:0});
      $('#mobile-menu').css('width','0px');
      var menuOffScreen = (-1 * ($('#mobile-menu').find('.site-menu').width())) - 5;
      $('#mobile-menu').find('.site-menu').animate({left: menuOffScreen}, 500, function() {});
    } else {
      $('#mobile-menu').find('.hamburger-menu').rotate({duration:500,angle: 0,animateTo:90});
      $('#mobile-menu').css('width','auto');
      $('#mobile-menu').find('.site-menu').animate({left: '-18px'}, 500, function() {});
    }
  });
  $('#navigation').on('click','#mobile-menu .nav-link-item',function() {
    if ($('#mobile-menu').css('width') !== '0px') {
      $('#mobile-menu').find('.hamburger-menu').rotate({duration:500,angle: 90,animateTo:0});
      $('#mobile-menu').css('width','0px');
      $('#mobile-menu').find('.site-menu').animate({left: menuOffScreen}, 500, function() {});
    } else {
      $('#mobile-menu').find('.hamburger-menu').rotate({duration:500,angle: 0,animateTo:90});
      $('#mobile-menu').css('width','auto');
      $('#mobile-menu').find('.site-menu').animate({left: '-18px'}, 500, function() {});
    }
  });
  $('#site-title').on('click',function() {
    if ($('#mobile-menu').css('width') !== '0px') {
      $('#mobile-menu').find('.hamburger-menu').rotate({duration:500,angle: 90,animateTo:0});
      $('#mobile-menu').css('width','0px');
      $('#mobile-menu').find('.site-menu').animate({left: menuOffScreen}, 500, function() {});
    }
    $('main').children().hide();
    $('.filters').hide();
  });
  $('#mobileMenu').find('.site-menu').animate({left: menuOffScreen}, 500, function() {});
  $('#mobile-menu').css('width','0px');
};
Navigation.prototype.addSocialLinks = function(data) {
  var $socialLinks = this.templates.getTemplate('navigation-social-link');
  $socialLinks = this.templates.renderTemplate($socialLinks,data);
  $mobileSocialLinks = $socialLinks.clone();
  $desktopSocialLinks = $socialLinks.clone();
  $mobileSocialLinks.appendTo('#mobile-menu ul');
  $desktopSocialLinks.appendTo('#desktop-menu .social ul');
};
Navigation.prototype.updateSocialLinks = function(data) {
  $('.nav-social-link-item').remove();
  this.view(data);
};
/* The AjaxHandler Object */
var AjaxHandler = function() {};
AjaxHandler.prototype.getData = function(URL,ASYNC) {
  var output = 'failure';
  $.ajax({url: URL, success: function(result) {
    console.log('Get Data: Returning data from ' + URL);
    output = result.toString();
  }, async: ASYNC, error: function() {
    console.log('Get Data: Failure when attempting to retrieve data from ' + URL);
  }});
  return output;
};
AjaxHandler.prototype.getData2 = function(URL,ASYNC) {
  $.ajax({url: URL, success: function(result) {
    console.log('Get Data: Returning data from ' + URL);
  }, async: ASYNC, error: function() {
    console.log('Get Data: Failure when attempting to retrieve data from ' + URL);
  }}).done(function(data) {
    return data.toString();
  });
};
AjaxHandler.prototype.getJSON = function(URL,ASYNC) {
  var output = '';
  $.ajax({url: URL, dataType:'json', success: function(result) {
    console.log('Get JSON: Successfully retrieved data from ' + URL);
    output = result;
  }, async: ASYNC, error: function() {
    console.log('Get JSON: Failure when attempting to retrieve JSON from ' + URL);
  }});
  return output;
};
AjaxHandler.prototype.getTemplate = function(template) {
  var URL = ('data/templates/' + template + '.html');
  var data = this.getData(URL,false);
  var $template = $(data);
  if (data !== '') {
    console.log('Get Template: Successfully loaded the \'' + template + '\' template.');
  } else {
    console.log('Get Template: Failed to load the \'' + template + '\' template.');
  }
  return $template;
};
AjaxHandler.prototype.checkForContentUpdate = function(currentVersion,versionURL) {
  console.log('Check For Content Update: Downloading the current content version to check for alteration.');
  var version = this.getData(versionURL,false);
  if (version.toString() !== currentVersion.toString()) {
    console.log('Check For Content Update: Content version change detected.');
    return true;
  } else {
    console.log('Check For Content Update: No content version change.');
    return false;
  }
};
/* The Templates Object */
var Templates = function(ajaxObj) {
  this.templates = [];
  this.templates['basic-articles'] = ajaxObj.getTemplate('basic-articles');
  this.templates['author-articles'] = ajaxObj.getTemplate('author-articles');
  this.templates['basic-article-filters'] = ajaxObj.getTemplate('basic-article-filters');
  this.templates['basic-page'] = ajaxObj.getTemplate('basic-page');
  this.templates['reference-page'] = ajaxObj.getTemplate('reference-page');
  this.templates['navigation-link'] = ajaxObj.getTemplate('navigation-link');
  this.templates['navigation-social-link'] = ajaxObj.getTemplate('navigation-social-link');
  this.templates['author-statistic'] = ajaxObj.getTemplate('author-statistic');
};
Templates.prototype.getTemplate = function(template) {
  return this.templates[template];
};
Templates.prototype.renderTemplate = function($template,context) {
  var handlebarTemplate = Handlebars.compile($template.html());
  return $(handlebarTemplate(context));
};
/* The Page Object */
var Page = function(pageSite,pageData) {
  this.model(pageSite,pageData);
  this.view();
  this.controller();
};
Page.prototype.model = function(pageSite,pageData) {
  this.site = pageSite;
  this.contentData = pageData;
  this.pageType = this.contentData.type;
  this.pageId = this.contentData.id;
  this.displayStates = [];
  if(this.pageType === 'basic-articles' || this.pageType === 'author-articles') {
    this.contentData = this.setupArticleData();
  }
  this.hasBeenRendered = false;
};
Page.prototype.view = function() {
  this.generatePage(this.contentData);
};
Page.prototype.controller = function() {
  this.site.pages.push(this);
};
Page.prototype.setupArticleData = function() {
  var currentDate = new Date();
  var pageSite = this.site;
  var articles = this.contentData;
  var array = [];
  $.each(this.contentData.articles,function(index,value) {
    if (articles.type === 'author-articles') {
      if (this.author === articles.author) {
        this.containerTitle = articles.title;
        this.urlTitle = this.title.replace(/[.,-\/#!$%\^&\*;:{}=\-_`~()]/g,'').replace(/ /g,'-');
        var publishedDate = new Date(this.date);
        var publishedYear = publishedDate.getFullYear();
        var publishedMonth = publishedDate.getMonth()+1;
        var publishedDay = function() {
          if(publishedDate.getDate()<10) {
            return ('0' + publishedDate.getDate());
          } else {
            return publishedDate.getDate();
          }
        }();
        var publishDate = (publishedYear.toString()+publishedMonth.toString()+publishedDay.toString());
        this.timePassed = (', '+moment(publishDate,'YYYYMMDD').endOf('day').fromNow());
        var content = marked(this.markdown);
        this.content = content;
        array.push(this);
      }
    } else {
      this.containerTitle = articles.title;
      this.urlTitle = this.title.replace(/[.,-\/#!$%\^&\*;:{}=\-_`~()]/g,'').replace(/ /g,'-');
      var publishedDate = new Date(this.date);
      var publishedYear = publishedDate.getFullYear();
      var publishedMonth = publishedDate.getMonth()+1;
      var publishedDay = function() {
        if(publishedDate.getDate()<10) {
          return ('0' + publishedDate.getDate());
        } else {
          return publishedDate.getDate();
        }
      }();
      var publishDate = (publishedYear.toString()+publishedMonth.toString()+publishedDay.toString());
      this.timePassed = (', '+moment(publishDate,'YYYYMMDD').endOf('day').fromNow());
      var content = marked(this.markdown);
      this.content = content;
    }
  });
  if (articles.type === 'author-articles') {
    this.contentData.articles = array;
  }
  return this.contentData;
};
Page.prototype.renderPage = function() {
  var elementId  = '';
  if (this.pageType === 'basic-articles' || this.pageType === 'author-articles') {
    elementId = '#' + this.contentData.title + '-container';
  } else if (this.pageType === 'basic-page' || this.pageType === 'reference-page') {
    elementId = '#' + this.contentData.title;
  }
  this.contentData.id = this.pageId;
  this.$obj = this.site.templates.getTemplate(this.pageType);
  this.$obj = this.site.templates.renderTemplate(this.$obj,this.contentData);
  $('main').find(elementId).remove();
  $('main').append(this.$obj);
};
Page.prototype.renderNavItem = function() {
  this.$navLink = this.site.templates.getTemplate('navigation-link');
  var navLinkData = {};
  navLinkData = {'title':this.contentData['title'],'url':(this.contentData['title']),'id':this.pageId};
  this.$mobileNavLink = this.site.templates.renderTemplate(this.$navLink,navLinkData);
  this.$desktopNavLink = this.site.templates.renderTemplate(this.$navLink,navLinkData);
  if (this.pageId.toString() === '0') {
    this.$mobileNavLink.prependTo($('#mobile-menu .site-menu ul'));
    this.$desktopNavLink.prependTo($('#desktop-menu .site-menu ul'));
  } else {
    var found = false;
    var skip = false;
    var counter = 1;
    var previousElement = '';
    do {
      previousElement = '.site-menu ul .page-' + (parseInt(this.pageId) - counter);
      var $previousElement = $(previousElement);
      if ($previousElement.length) {
        found = true;
      } else {
        counter += 1;
        if ((parseInt(this.pageId) - counter).toString() === '0') {
          this.$mobileNavLink.prependTo($('#mobile-menu .site-menu ul'));
          this.$desktopNavLink.prependTo($('#desktop-menu .site-menu ul'));
          found = true;
          skip = true;
        }
      }
    }
    while (!found);
    if (!skip) {
      var mobilePreviousElement = '#mobile-menu ' + previousElement;
      var desktopPreviousElement = '#desktop-menu ' + previousElement;
      this.$mobileNavLink.insertAfter($(mobilePreviousElement));
      this.$desktopNavLink.insertAfter($(desktopPreviousElement));
    }
  }
  var contentData = this.contentData;
  var pageType = this.pageType;
  var pageSite = this.site;
};
Page.prototype.renderArticleFilters = function() {
  if (this.pageType === 'basic-articles' || this.pageType === 'author-articles') {
    var $articleFilters = this.site.templates.getTemplate('basic-article-filters');
    var filterData = {
      'title' : this.contentData['title'],
      'authors' : [],
      'categories' : [],
      'id' : this.pageId
    };
    var authorsArray = [];
    var categoriesArray = [];
    var pageType = this.pageType;
    $.each(this.contentData['articles'],function(index,value) {
      if (pageType !== 'author-articles') {
        authorsArray.push(value.author);
      }
      categoriesArray.push(value.category);
    });
    if (this.pageType !== 'author-articles') {
      authorsArray = _.uniq(authorsArray);
    }
    categoriesArray = _.uniq(categoriesArray);
    if (this.pageType !== 'author-articles') {
      filterData['authors'].push({author:'All Authors'});
    }
    filterData['categories'].push({category:'All Categories'});
    $.each(authorsArray,function(index,value) {
      if (pageType !== 'author-articles') {
        filterData['authors'].push({author:value});
      }
    });
    $.each(categoriesArray,function(index,value) {
      filterData['categories'].push({category:value});
    });
    $articleFilters = this.site.templates.renderTemplate($articleFilters,filterData);
    if ($('#mobile-menu').css('display') === 'none') {
      $articleFilters.appendTo('#desktop-menu nav');
    } else {
      $articleFilters.appendTo('header');
    }
    if (this.pageType === 'author-articles') {
      $(('#' + this.contentData.title + ' .author-filter')).remove();
    }
  }
};
Page.prototype.resetSocialNavLinkPositions = function() {
  $socialNavLinks = $('#mobile-menu .nav-social-link-item').clone();
  $('#mobile-menu .nav-social-link-item').remove();
  $socialNavLinks.appendTo('#mobile-menu .site-menu ul');
};
Page.prototype.highlightCodeTags = function() {
  $('*').find('pre code').each(function(index,value){hljs.highlightBlock(value);});
};
Page.prototype.generatePage = function(pageData) {
  this.displayStates = this.collectDisplayData();
  $(('.page-' + this.pageId)).remove();
  this.contentData = pageData;
  this.pageType = this.contentData.type;
  if(this.pageType === 'basic-articles' || this.pageType === 'author-articles') {
    this.contentData = this.setupArticleData();
  }
  this.renderPage();
  this.renderNavItem();
  this.renderArticleFilters();
  this.resetSocialNavLinkPositions();
  this.highlightCodeTags();
  this.setContentDisplayCSS();
  this.resetPageActions();
  this.updateAddressBar(this.hasBeenRendered);
  if (!this.hasBeenRendered) {
    this.hasBeenRendered = true;
  }
};
Page.prototype.updateAddressBar = function(run) {
  if (run) {
    if (this.site.getCurrentPage().indexOf(this.pastContentData.title) > -1) {
      if (this.pageType === 'basic-articles' || this.pageType === 'author-articles') {
        if ((this.site.getCurrentPage().indexOf((this.pastContentData.title + '-')) > -1)) {
          var articleFound = false;
          for (i = 0; i < this.contentData.articles.length; i++) {
            for (j = 0; j < this.pastContentData.articles.length; j++) {
              if ((this.site.getCurrentPage().indexOf((this.pastContentData.articles[j].urlTitle)) > -1)) {
                if (this.contentData.articles[i].id === this.pastContentData.articles[j].id) {
                  var hashIndex = window.location.href.indexOf('#');
                  window.location.href = window.location.href.substring(0,hashIndex) + '#' + this.contentData.title + '-' + this.contentData.articles[i].urlTitle;
                  this.site.setCurrentPage();
                  articleFound = true;
                }
              }
            }
          }
          if (!articleFound) {
            var hashIndex = window.location.href.indexOf('#');
            window.location.href = window.location.href.substring(0,hashIndex) + '#' + this.contentData.title;
            this.site.setCurrentPage();
          }
        } else {
          var hashIndex = window.location.href.indexOf('#');
          window.location.href = window.location.href.substring(0,hashIndex) + '#' + this.contentData.title;
          this.site.setCurrentPage();
        }
      } else {
        var hashIndex = window.location.href.indexOf('#');
        window.location.href = window.location.href.substring(0,hashIndex) + '#' + this.contentData.title;
        this.site.setCurrentPage();
      }
    }
  }
};
Page.prototype.collectDisplayData = function(firstRender) {
  var output = [];
  this.pastContentData = this.contentData;
  if (this.pageType === 'basic-articles' || this.pageType === 'author-articles') {
    if (!firstRender) {
      var articles = this.contentData;
      var elements = $(('.page-' + this.pageId + ' article')).each(function(index) {
        if (($(this).attr('id')).toString().indexOf((articles.title + '-')) === 0) {
          var readMoreDisplay = $(this).find('.read-more').css('display');
          var articleId = articles.articles[index].id;
          var articleTitle = articles.articles[index].title;
          var articleDisplayData = [articleId,readMoreDisplay,articleTitle];
          output.push(articleDisplayData);
        }
      });
    }
  }
  return output;
};
Page.prototype.setContentDisplayCSS = function() {
  if (this.site.getCurrentPage() === this.pastContentData.title || (this.site.getCurrentPage().indexOf((this.pastContentData.title + '-')) > -1)) {
    if(this.pageType === 'basic-articles' || this.pageType === 'author-articles') {
      var $newFilters = $(('#' + this.contentData['title']));
      var $newArticles = $(('#' + this.contentData['title'] + '-container'));
      for (i = 0; i < this.contentData.articles.length; i++) {
        if (this.displayStates.length === 0) {
          $(' .article-content :not(:first-child)').hide();
          $newFilters.show();
        } else {
          for (j = 0; j < this.displayStates.length; j++) {
            if (this.contentData.articles[i].id === this.displayStates[j][0]) {
              var articleUrlTitle = this.contentData.articles[i].title.replace(/[.,-\/#!$%\^&\*;:{}=\-_`~()]/g,'').replace(/ /g,'-');
              if (this.displayStates[j][1] === 'inline') {
                $(('#' + this.contentData.title + '-' + articleUrlTitle + ' .article-content :not(:first-child)')).hide();
              } else if (this.displayStates[j][1] === 'none') {
                $(('#' + this.contentData.title + '-' + articleUrlTitle + ' .read-more')).hide();
              }
              if (this.displayStates.length === 0) {
                $(' .article-content :not(:first-child)').hide();
              }
              $newFilters.show();
            }
          }
        }
      }
    }
  } else {
    if (this.pageType === 'basic-articles' || this.pageType === 'author-articles') {
      $(('#' + this.contentData.title)).hide();
      $(('#' + this.contentData.title + '-container')).hide();
    } else {
      $(('#' + this.contentData.title)).hide();
    }
  }
};
Page.prototype.resetPageActions = function() {
  var contentData = this.contentData;
  var pageType = this.pageType;
  if (pageType === 'basic-articles' || pageType === 'author-articles') {
    var $filters = $(('#' + contentData['title']));
    var $articles = $(('#' + contentData['title'] + '-container' + ' article'));
    var $articleContainer = $(('#' + contentData['title'] + '-container'));
    $articles.on('click','.read-more',function() {
      $(this).parent().find('.article-content *').each(function(index,value) {
        $(value).show();
      });
      $(this).hide();
    });
    $filters.find('.author-filter').on('change',function() {
      $filters.find('.category-filter .filter-select').val('All Categories');
      $articles.show();
      var selection = $filters.find('.author-filter option:selected').attr('value');
      if (selection !== 'All Authors') {
        $articles.each(function() {
          var articleAuthor = $(this).find('.article-author').text();
          if (articleAuthor !== selection) {
            $articleContainer.find('article .article-content :not(:first-child)').hide();
            $articleContainer.find('.read-more').show();
            $(this).hide();
          }
        });
      }
    });
    $filters.find('.category-filter').on('change',function() {
      $filters.find('.author-filter .filter-select').val('All Authors');
      $articles.show();
      var selection = $filters.find('.category-filter option:selected').attr('value');
      if (selection !== 'All Categories') {
        $articles.each(function() {
          var articleCategory = $(this).find('.article-category span').text();
          if (articleCategory !== selection) {
            $articleContainer.find('article .article-content :not(:first-child)').hide();
            $articleContainer.find('.read-more').show();
            $(this).hide();
          }
        });
      }
    });
  }
};
