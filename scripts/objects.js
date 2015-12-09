/* The Site Object */
var Site = function(siteTitle,socialData) {
  this.container = $('main');
  $('#site-title a').text(siteTitle);
  this.ajax = new AjaxHandler();
  this.templates = new Templates(this.ajax);
  this.navigation = new Navigation(socialData,this.templates);
  this.articleIdIndex = 0;
  this.articlesIdIndex = 0;
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
AjaxHandler.prototype.getTemplate = function(template) {
  var URL = ('data/templates/' + template + '.html');
  var $template = {};
  $.ajax({url: URL, success: function(result) {
    $template = $(result);
  }, async:false});
  return $template;
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
  if(pageType === 'basic-articles') {
    pageData.id = pageSite.articlesIdIndex;
    pageSite.articlesIdIndex += 1;
    var currentDate = new Date();
    $.each(pageData['articles'],function(index,value) {
      this.id = pageSite.articleIdIndex;
      pageSite.articleIdIndex += 1;
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
    });
  }
  this.$obj = pageSite.templates.getTemplate(pageType);
  this.$obj = pageSite.templates.renderTemplate(this.$obj,pageData);
  $('main').append(this.$obj);
  this.$obj.hide();
  this.$navLink = pageSite.templates.getTemplate('navigation-link');
  var navLinkData = {};
  if(pageType === 'basic-articles') {
    navLinkData = {'title':pageData['title'],'url':(pageData['title'] + '-' + pageData['id'] + '-filters')};
  } else {
    navLinkData = {'title':pageData['title'],'url':(pageData['title'] + '-page')};
  }
  this.$mobileNavLink = pageSite.templates.renderTemplate(this.$navLink,navLinkData);
  this.$mobileNavLink.appendTo($('#mobile-menu .site-menu ul'));
  this.$desktopNavLink = pageSite.templates.renderTemplate(this.$navLink,navLinkData);
  this.$desktopNavLink.appendTo($('#desktop-menu .site-menu ul'));
  this.$mobileNavLink.on('click',function() {
    if(pageType === 'basic-articles') {
      var $articles = $('#' + pageData['title'] + '-' + pageData['id']);
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
      $('main').children().not(('#' + pageData['title'] + '-page')).hide();
      $('.filters').hide();
      $(('#' + pageData['title'] + '-page')).show();
    }
  });
  this.$desktopNavLink.on('click',function() {
    if(pageType === 'basic-articles') {
      var $articles = $('#' + pageData['title'] + '-' + pageData['id']);
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
      $('main').children().not(('#' + pageData['title'] + '-page')).hide();
      $('.filters').hide();
      $(('#' + pageData['title'] + '-page')).show();
    }
  });
  if (pageType === 'basic-articles') {
    var $articleFilters = pageSite.templates.getTemplate('basic-article-filters');
    var filterData = {
      'id' : pageData['id'],
      'title' : pageData['title'],
      'authors' : [],
      'categories' : []
    };
    var utility = new Utilities();
    var authorsArray = [];
    var categoriesArray = [];
    $.each(pageData['articles'],function(index,value) {
      authorsArray.push(value.author);
      categoriesArray.push(value.category);
    });
    authorsArray = utility.uniqueArray(authorsArray);
    categoriesArray = utility.uniqueArray(categoriesArray);
    filterData['authors'].push({author:'All Authors'});
    filterData['categories'].push({category:'All Categories'});
    $.each(authorsArray,function(index,value) {
      filterData['authors'].push({author:value});
    });
    $.each(categoriesArray,function(index,value) {
      filterData['categories'].push({category:value});
    });
    $articleFilters = pageSite.templates.renderTemplate($articleFilters,filterData);
    if ($('#mobile-menu').css('display') === 'none') {
      $articleFilters.appendTo('#desktop-menu nav');
      $articleFilters.hide();
    } else {
      $articleFilters.appendTo('header');
      $articleFilters.hide();
    }
    var $filters = $(('#' + pageData['title'] + '-' + pageData['id'] + '-filters'));
    var $articles = $(('#' + pageData['title'] + '-' + pageData['id'] + ' article'));
    var $articleContainer = $(('#' + pageData['title'] + '-' + pageData['id']));
    $filters.find('.author-filter').on('change',function() {
      $filters.find('.category-filter .filter-select').val('All Categories');
      $articles.show();
      var selection = $filters.find('.author-filter option:selected').attr('value');
      if (selection !== 'All Authors') {
        $articles.each(function() {
          var articleAuthor = $(this).find('.article-author').text();
          if(articleAuthor !== selection) {
            $articleContainer.find('article p:not(:first-child)').hide();
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
          if(articleCategory !== selection) {
            $articleContainer.find('article p:not(:first-child)').hide();
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
  $socialNavLinks = $('#mobile-menu .nav-social-link-item').clone();
  $('#mobile-menu .nav-social-link-item').remove();
  $socialNavLinks.appendTo('#mobile-menu .site-menu ul');
};
