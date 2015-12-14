/* The Site Object */
var Site = function(siteTitle,socialData,contentDirectoryPath) {
  this.renderedOnce = false;
  this.container = $('main');
  $('#site-title a').text(siteTitle);
  this.ajax = new AjaxHandler();
  this.contentURL = contentDirectoryPath + 'content.json';
  this.versionURL = contentDirectoryPath + 'version.txt';
  this.contentData = '';
  this.contentDataVersion = '';
  if (localStorage.getItem('contentDataVersion') === null) {
    this.contentDataVersion = this.ajax.getData(this.versionURL,false);
    localStorage.setItem('contentDataVersion',this.contentDataVersion);
  } else {
    this.contentDataVersion = localStorage.getItem('contentDataVersion');
  }
  if (this.ajax.checkForContentUpdate(this.contentDataVersion,this.versionURL)) {
    this.contentData = this.ajax.getJSON(this.contentURL,false);
    this.contentDataVersion = this.ajax.getData(this.versionURL,false);
    localStorage.setItem('contentData',JSON.stringify(this.contentData));
    localStorage.setItem('contentDataVersion',this.contentDataVersion);
  } else {
    if (localStorage.getItem('contentData') === null) {
      this.contentData = this.ajax.getJSON(this.contentURL,false);
      localStorage.setItem('contentData',JSON.stringify(this.contentData));
    } else {
      this.contentData = JSON.parse(localStorage.getItem('contentData'));
    }
  }
  this.getCurrentPage();
  this.templates = new Templates(this.ajax);
  this.navigation = new Navigation(socialData,this.templates);
  this.pageIdIndex = 0;
  this.pages = [];
  this.renderPages();
  this.renderedOnce = true;
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
Site.prototype.renderPages = function() {
  var about = new Page(this,'basic-page',{'title':'About','content':'<p>Hello, my name is James.  This is my Code Blog.</p>'});
  var links = new Page(this,'reference-page',{'title':'Links','content':'The following links are useful things from Code 301.  Enjoy.','links':[{linkTitle:'jQuery Data Method',linkUrl:'https://api.jquery.com/data/'},{linkTitle:'jQuery On Method',linkUrl:'https://api.jquery.com/on/'},{linkTitle:'The jQuery Method',linkUrl:'https://api.jquery.com/jQuery/'}]});
  var blog = new Page(this,'basic-articles',this.contentData);
};
Site.prototype.update = function() {
  if (this.renderedOnce) {
    if (this.ajax.checkForContentUpdate(this.contentDataVersion,this.versionURL)) {
      this.contentData = this.ajax.getJSON(this.contentURL,false);
      this.contentDataVersion = this.ajax.getData(this.versionURL,false);
      localStorage.setItem('contentData',JSON.stringify(this.contentData));
      localStorage.setItem('contentDataVersion',this.contentDataVersion);
      for(i=0; i < this.pages.length; i++) {
        if (this.pages[i].pageType === 'basic-articles') {
          this.pages[i].generatePage(this.pages[i].pageType,this.contentData);
        }
      }
    }
  }
};
/* The Navigation Object */
var Navigation = function(socialData,siteTemplates) {
  this.pages = [];
  this.templates = siteTemplates;
  this.setupHamburgerMenu();
  this.addSocialLinks(socialData);
};
Navigation.prototype.setupHamburgerMenu = function() {
  var menuOffScreen = (-1 * ($('#mobile-menu').find('.site-menu').width())) - 5;
  $('#navigation').on('click','.hamburger-menu',function() {
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
var Page = function(pageSite,pageType,pageData) {
  this.site = pageSite;
  this.pageType = pageType;
  this.contentData = pageData;
  this.pageId = this.site.pageIdIndex;
  this.site.pageIdIndex += 1;
  this.displayStates = [];
  if(pageType === 'basic-articles') {
    this.contentData = this.setupArticleData();
  }
  this.generatePage(this.pageType,this.contentData);
  this.site.pages.push(this);
};
Page.prototype.setupArticleData = function() {
  var currentDate = new Date();
  var pageSite = this.site;
  var articleIdIndex = this.pageArticleIdStart;
  var articles = this.contentData;
  $.each(this.contentData.articles,function(index,value) {
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
  });
  return this.contentData;
};
Page.prototype.renderPage = function(firstRender) {
  var elementId  = '';
  if (this.pageType === 'basic-articles') {
    elementId = '#' + this.contentData.title + '-container';
  } else if (this.pageType === 'basic-page' || this.pageType === 'reference-page') {
    elementId = '#' + this.contentData.title;
  }
  this.contentData.id = this.pageId;
  this.$obj = this.site.templates.getTemplate(this.pageType);
  this.$obj = this.site.templates.renderTemplate(this.$obj,this.contentData);
  $('main').find(elementId).remove();
  $('main').append(this.$obj);
  if (firstRender) {
    if (this.site.getCurrentPage() !== this.contentData.title) {
      this.$obj.hide();
    }
  }
};
Page.prototype.renderNavItem = function(firstRender) {
  this.$navLink = this.site.templates.getTemplate('navigation-link');
  var navLinkData = {};
  navLinkData = {'title':this.contentData['title'],'url':(this.contentData['title']),'id':this.pageId};
  this.$mobileNavLink = this.site.templates.renderTemplate(this.$navLink,navLinkData);
  this.$desktopNavLink = this.site.templates.renderTemplate(this.$navLink,navLinkData);
  if (firstRender) {
    this.$mobileNavLink.appendTo($('#mobile-menu .site-menu ul'));
    this.$desktopNavLink.appendTo($('#desktop-menu .site-menu ul'));
  } else if (this.pageId.toString() === '0') {
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
  if (firstRender) {
    this.$mobileNavLink.on('click',function() {
      if(pageType === 'basic-articles') {
        var $articles = $(('#' + contentData['title'] + '-container'));
        $('main').children().not($articles).hide();
        $articles.find('article .article-content :not(:first-child)').hide();
        $articles.find('.read-more').show();
        $articles.find('article').show();
        $articles.on('click','.read-more',function() {
          $(this).parent().find('.article-content *').each(function(index,value) {
            $(value).show();
          });
          $(this).hide();
        });
        $articles.show();
      } else {
        $('main').children().not(('#' + contentData['title'])).hide();
        $('.filters').hide();
        $(('#' + contentData['title'])).show();
      }
    });
    this.$desktopNavLink.on('click',function() {
      if(pageType === 'basic-articles') {
        var $articles = $(('#' + contentData['title'] + '-container'));
        $('main').children().not($articles).hide();
        $articles.find('article .article-content :not(:first-child)').hide();
        $articles.find('.read-more').show();
        $articles.find('article').show();
        $articles.on('click','.read-more',function() {
          $(this).parent().find('.article-content *').each(function(index,value) {
            $(value).show();
          });
          $(this).hide();
        });
        $articles.show();

      } else {
        $('main').children().not(('#' + contentData['title'])).hide();
        $('.filters').hide();
        $(('#' + contentData['title'])).show();
      }
    });
  }
};
Page.prototype.renderArticleFilters = function(firstRender) {
  if (this.pageType === 'basic-articles') {
    var $articleFilters = this.site.templates.getTemplate('basic-article-filters');
    var filterData = {
      'title' : this.contentData['title'],
      'authors' : [],
      'categories' : [],
      'id' : this.pageId
    };
    var authorsArray = [];
    var categoriesArray = [];
    $.each(this.contentData['articles'],function(index,value) {
      authorsArray.push(value.author);
      categoriesArray.push(value.category);
    });
    authorsArray = _.uniq(authorsArray);
    categoriesArray = _.uniq(categoriesArray);
    filterData['authors'].push({author:'All Authors'});
    filterData['categories'].push({category:'All Categories'});
    $.each(authorsArray,function(index,value) {
      filterData['authors'].push({author:value});
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
    if (firstRender) {
      $articleFilters.hide();
      var $filters = $(('#' + this.contentData['title']));
      var $articles = $(('#' + this.contentData['title'] + '-container' + ' article'));
      var $articleContainer = $(('#' + this.contentData['title'] + '-container'));
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
      this.$mobileNavLink.on('click',function() {
        $filters.show();
        $filters.find('.author-filter .filter-select').val('All Authors');
        $filters.find('.category-filter .filter-select').val('All Categories');
      });
      this.$desktopNavLink.on('click',function() {
        $filters.show();
        $filters.find('.author-filter .filter-select').val('All Authors');
        $filters.find('.category-filter .filter-select').val('All Categories');
      });
      $(window).on('resize',function() {
        if ($('#mobile-menu').css('display') === 'none') {
          $articleFilters.appendTo('#desktop-menu nav');
        } else {
          $articleFilters.appendTo('header');
        }
      });
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
Page.prototype.generatePage = function(pageType,pageData) {
  this.displayStates = this.collectDisplayData();
  $(('.page-' + this.pageId)).remove();
  this.pageType = pageType;
  this.contentData = pageData;
  if(this.pageType === 'basic-articles') {
    this.contentData = this.setupArticleData();
  }
  this.renderPage(false);
  this.renderNavItem(false);
  this.renderArticleFilters(false);
  this.resetSocialNavLinkPositions();
  this.highlightCodeTags();
  this.setContentDisplayCSS();
  this.resetPageActions();
  this.updateAddressBar();
};
Page.prototype.updateAddressBar = function() {
  if (this.site.getCurrentPage().indexOf(this.pastContentData.title) > -1) {
    if (this.pageType === 'basic-articles') {
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
};
Page.prototype.collectDisplayData = function(firstRender) {
  var output = [];
  this.pastContentData = this.contentData;
  if (this.pageType === 'basic-articles') {
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
    if(this.pageType === 'basic-articles') {
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
    if (this.pageType === 'basic-articles') {
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
  this.$mobileNavLink.on('click',function() {
    if(pageType === 'basic-articles') {
      var $articles = $(('#' + contentData['title'] + '-container'));
      $('main').children().not($articles).hide();
      $articles.find('article .article-content :not(:first-child)').hide();
      $articles.find('.read-more').show();
      $articles.find('article').show();
      $articles.show();
    } else {
      $('main').children().not(('#' + contentData['title'])).hide();
      $('.filters').hide();
      $(('#' + contentData['title'])).show();
    }
  });
  this.$desktopNavLink.on('click',function() {
    if(pageType === 'basic-articles') {
      var $articles = $(('#' + contentData['title'] + '-container'));
      $('main').children().not($articles).hide();
      $articles.find('article .article-content :not(:first-child)').hide();
      $articles.find('.read-more').show();
      $articles.find('article').show();
      $articles.show();
    } else {
      $('main').children().not(('#' + contentData['title'])).hide();
      $('.filters').hide();
      $(('#' + contentData['title'])).show();
    }
  });
  if (pageType === 'basic-articles') {
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
    this.$mobileNavLink.on('click',function() {
      $filters.show();
      $filters.find('.author-filter .filter-select').val('All Authors');
      $filters.find('.category-filter .filter-select').val('All Categories');
    });
    this.$desktopNavLink.on('click',function() {
      $filters.show();
      $filters.find('.author-filter .filter-select').val('All Authors');
      $filters.find('.category-filter .filter-select').val('All Categories');
    });
  }
};
