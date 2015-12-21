/* The Site Object */
var Site = function(siteTitle,contentDirectoryPath,githubUserName) {
  this.preView(siteTitle,true);
  this.model(siteTitle,contentDirectoryPath,githubUserName);
  var loading = false;
  var viewLoaded = false;
  var controllerLoaded = false;
  var routerLoaded = false;
  var that = this;
  var setup = setInterval(function() {
    if (that.loaded) {
      if (!loading && !viewLoaded) {
        loading = true;
        that.preView(siteTitle,false);
        that.view();
        viewLoaded = true;
        loading = false;
      } else if (!loading && !controllerLoaded) {
        loading = true;
        that.controller();
        controllerLoaded = true;
        loading = false;
      } else if (!loading && !routerLoaded) {
        loading = true;
        that.router();
        routerLoaded = true;
        loading = false;
      } else if (viewLoaded && controllerLoaded && routerLoaded) {
        console.log('SITE: The site has been fully instantiated.');
        clearInterval(setup);
      }
    }
  },10);
};
Site.prototype.model = function(siteTitle,contentDirectoryPath,githubUserName) {
  this.title = siteTitle;
  this.renderedOnce = false;
  this.container = $('main');
  this.contentURL = contentDirectoryPath + 'content.json';
  this.githubReposURL = '/github/users/' + githubUserName + '/repos?per_page=100&sort=updated';
  this.githubURL = '/github/users/' + githubUserName;
  this.socialURL = contentDirectoryPath + 'social.json';
  this.versionURL = contentDirectoryPath + 'version.txt';
  this.templatesLoaded = false;
  this.contentDataVersion = '';
  this.contentData = '';
  this.githubReposData = '';
  this.githubData = '';
  this.socialData = '';
  this.dataLoading = false;
  this.templates = new Templates(this);
  var templates = this.templates;
  this.pages = [];
  this.loaded = false;
  var that = this;
  var templatesLoaded = false;
  var versionLoaded = false;
  var contentLoaded = false;
  var githubReposLoaded = false;
  var githubLoaded = false;
  var socialLoaded = false;
  var loading = setInterval(function() {
    if (that.templates.loaded) {
      if(!templatesLoaded) {
        console.log('SITE: Templates loaded successfully.  Proceeding to load the content data version.');
        templatesLoaded = true;
      } else if (!that.dataLoading && !versionLoaded) {
        that.dataLoading = true;
        $.ajax({url: that.versionURL, success: function() {
          console.log('SITE: Returning data from ' + that.versionURL);
        }, error: function() {
          console.log('SITE: Failure when attempting to retrieve data from ' + that.versionURL);
        }}).done(function(data) {
          that.setContentDataVersion(data.toString());
          versionLoaded = true;console.log('SITE: Content data version loaded successfully.  The current version is "' + that.contentDataVersion + '".  Proceeding to load the content data.');
          that.dataLoading = false;
        });
      } else if (!that.dataLoading && !contentLoaded) {
        that.dataLoading = true;
        $.ajax({url: that.contentURL, dataType: 'json', success: function() {
          console.log('SITE: Returning JSON data from ' + that.contentURL);
        }, error: function() {
          console.log('SITE: Failure when attempting to retrieve JSON data from ' + that.contentURL);
        }}).done(function(data) {
          that.setContentData(data);
          contentLoaded = true;
          console.log('SITE: Content data loaded successfully.  Proceeding to load Github account data.');
          that.dataLoading = false;
        });
      } else if (!that.dataLoading && !githubLoaded) {
        that.dataLoading = true;
        $.ajax({url: that.githubURL, type: 'GET', dataType: 'json', success: function() {
          console.log('SITE: Returning JSON data from ' + that.githubURL);
        }, error: function() {
          console.log('SITE: Failure when attempting to retrieve JSON data from ' + that.githubURL);
        }}).done(function(data) {
          var githubJSON = {'author':data.name.toString(),'publicRepoCount':data.public_repos.toString(),'authorUrl':data.html_url.toString()};
          that.setGithubData(githubJSON);
          githubLoaded = true;
          console.log('SITE: Github data loaded successfully.  Proceeding to load Github repos data.');
          that.dataLoading = false;
        });
      } else if (!that.dataLoading && !githubReposLoaded) {
        that.dataLoading = true;
        $.ajax({url: that.githubReposURL, type: 'GET', dataType: 'json', success: function() {
          console.log('SITE: Returning JSON data from ' + that.githubReposURL);
        }, error: function() {
          console.log('SITE: Failure when attempting to retrieve JSON data from ' + that.githubReposURL);
        }}).done(function(data) {
          var githubReposJSON = [];
          $.each(data,function(index,value) {
            var githubRepoJSON = {'name':data[index].name.toString(),'repoUrl':data[index].html_url.toString(),'description':data[index].description.toString(),'creationDate':data[index].created_at.toString().substring(0,10),'lastUpdateDate':data[index].updated_at.toString().substring(0,10),'cloneUrl':data[index].clone_url.toString()};
            if (data[index].fork.toString() === 'true') {
              githubRepoJSON.isFork = 'true';
            } else {
              githubRepoJSON.isFork = '';
            }
            githubReposJSON.push(githubRepoJSON);
          });
          that.setGithubReposData(githubReposJSON);
          githubReposLoaded = true;
          console.log('SITE: Github data loaded successfully.  Proceeding to load the social media links data.');
          that.dataLoading = false;
        });
      } else if (!that.dataLoading && !socialLoaded) {
        that.dataLoading = true;
        $.ajax({url: that.socialURL, dataType: 'json', success: function() {
          console.log('SITE: Returning JSON data from ' + that.socialURL);
        }, error: function() {
          console.log('SITE: Failure when attempting to retrieve JSON data from ' + that.socialURL);
        }}).done(function(data) {
          that.setSocialData(data);
          socialLoaded = true;
          console.log('SITE: Social links\' data loaded successfully.');
          that.dataLoading = false;
        });
      }
    }
    if (templatesLoaded && versionLoaded && contentLoaded && githubLoaded && githubReposLoaded && socialLoaded) {
      that.isLoaded();
      that.setGithubAccount(that.githubData,that.githubReposData);
      console.log('SITE: All site content has been loaded successfully.  Ready to generate pages.');
      clearInterval(loading);
    }
  },10);
  this.getCurrentPage();
  this.currentVersion = '';
  this.currentContentDataVersionLoaded = false;
  this.updateLoading = false;
  this.updateResolutionLoading = false;
  this.contentUpdateExists = false;
  this.contentUpdateCheckResolved = false;
  this.updateContentDataLoaded = false;
  this.updateSocialDataLoaded = false;
};
Site.prototype.setGithubAccount = function(account,repos) {
  this.githubAccount = new GithubAccount(account,repos);
};
Site.prototype.setGithubReposData = function(data) {
  this.githubReposData = data;
};
Site.prototype.setGithubData = function(data) {
  this.githubData = data;
};
Site.prototype.setUpdateContentDataLoaded = function(data) {
  this.updateContentDataLoaded = data;
};
Site.prototype.setUpdateSocialDataLoaded = function(data) {
  this.updateSocialDataLoaded = data;
};
Site.prototype.setCurrentVersion = function(data) {
  this.currentVersion = data;
};
Site.prototype.setCurrentContentDataVersionLoaded = function(data) {
  this.currentContentDataVersionLoaded = data;
};
Site.prototype.setUpdateLoading = function(data) {
  this.updateLoading = data;
};
Site.prototype.setUpdateResolutionLoading = function(data) {
  this.updateResolutionLoading = data;
};
Site.prototype.setContentUpdateExists = function(data) {
  this.contentUpdateExists = data;
};
Site.prototype.setContentUpdateCheckResolved = function(data) {
  this.contentUpdateCheckResolved = data;
};
Site.prototype.setContentDataVersion = function(data) {
  this.contentDataVersion = data;
  this.contentDataVersionIsLoaded = true;
  localStorage.setItem('contentDataVersion',this.contentDataVersion);
};
Site.prototype.setContentData = function(data) {
  this.contentData = data;
  localStorage.setItem('contentData',JSON.stringify(this.contentData));
};
Site.prototype.setSocialData = function(data) {
  this.socialData = data;
  localStorage.setItem('socialData',JSON.stringify(this.socialData));
};
Site.prototype.isLoaded = function() {
  this.loaded = true;
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
  var contentUpdateCheck = setInterval(function() {
    if (site.renderedOnce && !site.contentUpdatExists) {
      if (!site.updateResolutionLoading && !site.currentContentDataVersionLoaded) {
        site.setUpdateResolutionLoading(true);
        $.ajax({url: site.versionURL, success: function() {
          console.log('SITE: Returning data from ' + site.versionURL);
        }, error: function() {
          console.log('SITE: Failure when attempting to retrieve data from ' + site.versionURL);
        }}).done(function(data) {
          site.setCurrentVersion(data.toString());
          site.setCurrentContentDataVersionLoaded(true);
          site.setUpdateResolutionLoading(false);
        });
      } else if (site.currentContentDataVersionLoaded && !site.contentUpdateCheckResolved) {
        if (site.currentVersion.toString() !== site.contentDataVersion.toString()) {
          console.log('SITE: Check For Content Update: Content version change detected.');
          site.setContentUpdateExists(true);
          site.setContentUpdateCheckResolved(true);
        } else {
          console.log('SITE: Check For Content Update: No content version change.');
          site.setContentUpdateCheckResolved(true);
        }
      }
    }
  },60000);
  var updateContent = setInterval(function() {
    if (site.renderedOnce && site.contentUpdateCheckResolved) {
      if (site.contentUpdateExists) {
        site.contentDataVersion = site.currentVersion;
        localStorage.setItem('contentDataVersion',site.contentDataVersion);
        if (!site.updateLoading && !site.updateContentDataLoaded) {
          site.setUpdateLoading(true);
          $.ajax({url: site.contentURL, dataType: 'json', success: function() {
            console.log('SITE: Returning JSON data from ' + site.contentURL);
          }, error: function() {
            console.log('SITE: Failure when attempting to retrieve JSON data from ' + site.contentURL);
          }}).done(function(data) {
            site.setContentData(data);
            site.setUpdateContentDataLoaded(true);
            console.log('SITE: Updated content data loaded successfully.  Proceeding to load the updated social media links data.');
            site.setUpdateLoading(false);
          });
        } else if (!site.updateLoading && !site.updateSocialDataLoaded) {
          site.setUpdateLoading(true);
          $.ajax({url: site.socialURL, dataType: 'json', success: function() {
            console.log('SITE: Returning JSON data from ' + site.socialURL);
          }, error: function() {
            console.log('SITE: Failure when attempting to retrieve JSON data from ' + site.socialURL);
          }}).done(function(data) {
            site.setSocialData(data);
            site.setUpdateSocialDataLoaded(true);
            console.log('SITE: Updated social media links\' data loaded successfully.');
            site.setUpdateLoading(false);
          });
        } else if (!site.updateLoading && site.updateContentDataLoaded && site.updateSocialDataLoaded) {
          site.setUpdateLoading(true);
          console.log('SITE: Updated content and social media links\' data loaded successfully.  Proceeding to update the view.');
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
          console.log('SITE: Updated the view with new content and social media link\'s data successfully.');
          site.setContentUpdateCheckResolved(false);
          site.setCurrentContentDataVersionLoaded(false);
          site.setContentUpdateExists(false);
          site.setUpdateContentDataLoaded(false);
          site.setUpdateSocialDataLoaded(false);
          site.setUpdateLoading(false);
        }
      } else if (!site.contentUpdateExists && site.contentUpdateCheckResolved) {
        site.setContentUpdateCheckResolved(false);
        site.setCurrentContentDataVersionLoaded(false);
        site.setContentUpdateCheckResolved(false);
        site.setCurrentContentDataVersionLoaded(false);
        site.setContentUpdateExists(false);
        site.setUpdateContentDataLoaded(false);
        site.setUpdateSocialDataLoaded(false);
        site.setUpdateLoading(false);
      }
    }
  },60000);
  var updateAddressBarURL = setInterval(function() {
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
      var filterValue = '';
      var filterType = '';
      if (pageTitle.indexOf('-') > -1) {
        if (pageTitle.indexOf('+') > -1)
        {
          subPageTitle = pageTitle.substring((pageTitle.indexOf('-') + 1),pageTitle.length);
          filterValue = subPageTitle.substring((subPageTitle.indexOf('=') + 1),subPageTitle.length);
          filterType = pageTitle.substring((pageTitle.indexOf('+') + 1),pageTitle.indexOf('='));
          subPageTitle = subPageTitle.substring(0,plusIndex);
        } else {
          subPageTitle = pageTitle.substring((pageTitle.indexOf('-') + 1),pageTitle.length);
        }
        pageTitle = pageTitle.substring(0,pageTitle.indexOf('-'));
      } else if (pageTitle.indexOf('+') > -1) {
        filterValue = pageTitle.substring((pageTitle.indexOf('=') + 1),pageTitle.length);
        filterType = pageTitle.substring((pageTitle.indexOf('+') + 1),pageTitle.indexOf('='));
        pageTitle = pageTitle.substring(0,pageTitle.indexOf('+'));
      }
      filterValue = filterValue.replace(/_/g,' ');
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
        if (filterType === 'Author') {
          $((pageTitle + ' .author-filter .filter-select')).val(filterValue);
          $((pageTitle + '-container article')).each(function() {
            var articleAuthor = $(this).find('.article-author').text();
            if (articleAuthor !== filterValue) {
              $((pageTitle + '-container')).find('article .article-content :not(:first-child)').hide();
              $((pageTitle + '-container')).find('.read-more').show();
              $(this).hide();
            }
          });
        } else {
          $((pageTitle + ' .author-filter .filter-select')).val('All Authors');
        }
        if (filterType === 'Category') {
          $((pageTitle + ' .category-filter .filter-select')).val(filterValue);
          $((pageTitle + '-container article')).each(function() {
            var articleCategory = $(this).find('.article-category').text();
            if (articleCategory !== filterValue) {
              $((pageTitle + '-container')).find('article .article-content :not(:first-child)').hide();
              $((pageTitle + '-container')).find('.read-more').show();
              $(this).hide();
            }
          });
        } else {
          $((pageTitle + ' .category-filter .filter-select')).val('All Categories');
        }
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
Site.prototype.preView = function(siteTitle,show) {
  if (show) {
    $('#site-title a').text(siteTitle);
    $('header').append('<img class="pre-loader" src="images/loader.gif" width="120" height="120"/>');
    $('.pre-loader').css('margin-left',((($('html').width() / 2) - 12.5) + 'px'));
  } else if (!show) {
    $('.pre-loader').remove();
  }
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
    event.defaultPrevented;
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
/* The Templates Object */
var Templates = function(site) {
  site.dataLoading = true;
  this.templates = [];
  this.templates.push('basic-articles');
  this.templates.push('author-articles');
  this.templates.push('basic-article-filters');
  this.templates.push('basic-page');
  this.templates.push('reference-page');
  this.templates.push('navigation-link');
  this.templates.push('navigation-social-link');
  this.templates.push('author-statistic');
  this.templates.push('github-about');
  for (i = 0; i < this.templates.length; i++) {
    this.templates[this.templates[i]] = 'NULL';
  }
  var that = this;
  var templateLoading = false;
  var templateCounter = 0;
  var loader = setInterval(function() {
    if ((!templateLoading) && (templateCounter < that.templates.length)) {
      templateLoading = true;
      var URL = ('data/templates/' + that.templates[templateCounter] + '.html');
      var template = that.templates[templateCounter];
      $.ajax({url: URL, success: function() {
        console.log('TEMPLATES: Returning data from ' + URL);
      }, error: function() {
        console.log('TEMPLATES: Failure when attempting to retrieve data from ' + URL);
      }}).done(function(data) {
        that.setTemplate(template,data.toString());
        templateCounter++;
        templateLoading = false;
      });
    } else if (templateCounter === that.templates.length) {
      console.log('TEMPLATES: Templates\' data has been fully loaded via Ajax.');
      clearInterval(loader);
    }
  },10);
  this.loaded = false;
  that = this;
  var loading = setInterval(function() {
    var load = true;
    console.log('TEMPLATES: Starting Template Load Check Loop');
    for (i = 0; i < that.templates.length; i++) {
      if (that.templates[that.templates[i]] === 'NULL') {
        console.log('TEMPLATES: ' + that.templates[i] + ' template not loaded.');
        load = false;
      }
    }
    if (load) {
      console.log('TEMPLATES: Templates successfully loaded and ready for manipulation.');
      that.isLoaded();
      site.dataLoading = false;
      clearInterval(loading);
    }
  },10);
};
Templates.prototype.setTemplate = function(template,data) {
  this.templates[template] = $(data);
};
Templates.prototype.isLoaded = function () {
  this.loaded = true;
};
Templates.prototype.getTemplate = function(template) {
  return this.templates[template];
};
Templates.prototype.renderTemplate = function($template,context) {
  var handlebarTemplate = Handlebars.compile($template.html());
  return $(handlebarTemplate(context));
};
/* The GitHub Account Object - includes repos data.*/
var GithubAccount = function(accountData,repoData) {
  this.model(accountData,repoData);
  this.view();
  this.controller();
};
GithubAccount.prototype.model = function(accountData,repoData) {
  this.data = {'account':accountData,'repos':repoData};
};
GithubAccount.prototype.view = function() {};
GithubAccount.prototype.controller = function() {};
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
  } else if (this.pageType === 'github-about') {
    this.setupGithubAboutInformation();
  }
  this.hasBeenRendered = false;
};
Page.prototype.view = function() {
  this.generatePage(this.contentData);
};
Page.prototype.controller = function() {
  this.site.pages.push(this);
};
Page.prototype.setupGithubAboutInformation = function() {
  this.contentData.author = this.site.githubAccount.data.account.author;
  this.contentData.authorUrl = this.site.githubAccount.data.account.authorUrl;
  this.contentData.publicRepoCount = this.site.githubAccount.data.account.publicRepoCount;
  this.contentData.repos = this.site.githubAccount.data.repos;
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
  this.$obj.hide();
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
      $articleFilters.hide();
      $articleFilters.appendTo('#desktop-menu nav');
    } else {
      $articleFilters.hide();
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
  if (this.pageType === 'basic-articles' || this.pageType === 'author-articles') {
    this.contentData = this.setupArticleData();
  } else if (this.pageType === 'github-about') {
    this.setupGithubAboutInformation();
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
      var selection = $filters.find('.author-filter option:selected').attr('value');
      var newURL = window.location.href;
      if (selection !== 'All Authors') {
        if (newURL.indexOf('-') > -1) {
          newURL = newURL.substring(0,newURL.indexOf('-'));
        }
        if (newURL.indexOf('+') > -1) {
          newURL = newURL.substring(0,newURL.indexOf('+'));
        }
        window.location.href = newURL + '+Author=' + selection.replace(/ /g,'_');
      } else {
        if (newURL.indexOf('-') > -1) {
          newURL = newURL.substring(0,newURL.indexOf('-'));
        }
        if (newURL.indexOf('+') > -1) {
          newURL = newURL.substring(0,newURL.indexOf('+'));
        }
        window.location.href = newURL;
      }
    });
    $filters.find('.category-filter').on('change',function() {
      $filters.find('.author-filter .filter-select').val('All Authors');
      var selection = $filters.find('.category-filter option:selected').attr('value');
      var newURL = window.location.href;
      if (selection !== 'All Categories') {
        if (newURL.indexOf('-') > -1) {
          newURL = newURL.substring(0,newURL.indexOf('-'));
        }
        if (newURL.indexOf('+') > -1) {
          newURL = newURL.substring(0,newURL.indexOf('+'));
        }
        window.location.href = newURL + '+Category=' + selection.replace(/ /g,'_');
      } else {
        if (newURL.indexOf('-') > -1) {
          newURL = newURL.substring(0,newURL.indexOf('-'));
        }
        if (newURL.indexOf('+') > -1) {
          newURL = newURL.substring(0,newURL.indexOf('+'));
        }
        window.location.href = newURL;
      }
    });
  }
};
