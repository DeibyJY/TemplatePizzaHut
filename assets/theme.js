(function ($) {
    var $body = $('body'),
        $doc = $(document),
        $html = $('html'),
        $win = $(window);

    $doc.ready(() => {
        $doc.ajaxStart(() => {
            scoder.isAjaxLoading = true;
        });

        $doc.ajaxStop(() => {
            scoder.isAjaxLoading = false;
        });

        scoder.ready();
    });

    window.onload = function() { 
        scoder.init();
    }

    var scoder = {
        scoderTimeout: null,
        isAjaxLoading: false,

        ready: function (){
            this.loaderScript();
            this.loaderProductBlock();
            
            if (navigator.userAgent.match(/OS X.*Safari/) && ! navigator.userAgent.match(/Chrome/)) {
                document.body.classList.add('safari')
            } else {
                document.body.classList.add('chrome')
            }

            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            if (isIOS) document.body.classList.add('iOS')

            if($body.hasClass('template-product')) {
                this.loaderRecommendationsBlock();
                this.scrollToReview();
            }

            if ($body.hasClass('product-card-layout-07')) {
                this.calculateTranslateYHeight()
            }
            
            window.sharedFunctions = {
                setLocalStorageProductForWishlist: this.setLocalStorageProductForWishlist,
                checkNeedToConvertCurrency: this.checkNeedToConvertCurrency,
                productBlockSilder: this.productBlockSilder,    
                productBlockScroller: this.productBlockScroller,
                calculateTranslateYHeight: this.calculateTranslateYHeight,
            };
        },
        
        init: function () {
            this.initMultiTab();
            this.initMultiTabMobile();
            this.productBlockInfiniteScroll();
            this.initGlobalCheckbox();
            this.initColorSwatch();
            this.initAddToCart();
            this.initQuickShop();
            this.initQuickCart();
            this.initNotifyInStock();
            this.initCompareProduct();
            this.initWishlist();
            this.initAskAnExpert();
            this.headerdropdownCurrency();
            this.headerdropdownLanguage();
            this.headerSidebarSearch();
            this.initCountdown();
            this.initVideoPopup();
            this.initDynamicBrowserTabTitle();
            this.initWarningPopup();

            // Quick View Product
            if (document.querySelector('[data-open-quick-view-popup]') != null) {
                this.initQuickView();
            }

            // Image Lazyload
            const loadingImages = document.querySelectorAll('.media--loading-effect img')
            const productGrid = document.getElementById('main-collection-product-grid')

            if (loadingImages.length > 0 || productGrid) {
                this.initLazyloadObserver(loadingImages, productGrid);
            }

            if($body.hasClass('show_effect_close')) {
                this.backgroundOverlayHoverEffect();
            }

            if($body.hasClass('template-cart')) {
                this.updateGiftWrapper();
            }
            
            if($body.hasClass('template-product')) {
                this.initProductView($('.scoder-productView'));
                this.initProductBundle();
                this.articleGallery();
                this.toggleSidebarMobile(); 
                this.initCollapseSidebarBlock();    
                this.initCategoryActive();
                this.initProductReviewSection();
                this.productCustomInformation();
                this.iconZoomClickMobile();
            }

            if($body.hasClass('template-blog') || $body.hasClass('template-article')) {
                this.initCollapseSidebarBlock();
                this.initCategoryActive();
                this.toggleSidebarMobile();
                this.productBlockSilderSidebar();
                this.productBlockSilderArticle();
            }

            if($body.hasClass('template-article')) {
                this.articleGallery();
            }

            if($body.hasClass('template-collection') || $body.hasClass('template-search')) {
                this.initCollapseSidebarBlock();
                this.initCategoryActive();
                this.toggleSidebarMobile();
                this.productBlockSilderSidebar();
                this.initQuickShopProductList();
                this.initInfiniteScrolling();
            }

            if($body.hasClass('template-collection') && $('.collection-express-order').length) {
                this.toggleVariantsForExpressOrder();
                this.initExpressOrderAddToCart();
            }

            if($body.hasClass('template-list-collections')) {
                this.toggleSidebarMobile();
            }
            
            scoder.checkScrollLayoutForRecenlyViewed();

            $win.on('resize', () => {
                this.headerSidebarSearch();
            });
        },
        
        checkNeedToConvertCurrency: function () {
            return (window.show_multiple_currencies && Currency.currentCurrency != shopCurrency) || window.show_auto_currency;
        },

        loaderScript: function() {
            var load = function(){
                var script = $('[data-loader-script]');

                if (script.length > 0) {
                    script.each((index, element) => {
                        var $this = $(element),
                            link = $this.data('loader-script'),
                            top = element.getBoundingClientRect().top;

                        if (!$this.hasClass('is-load')){
                            if (top < window.innerHeight + 100) {
                                scoder.buildScript(link);
                                $('[data-loader-script="' + link + '"]').addClass('is-load');
                            }
                        }
                    })
                }
            }
            
            load();
            window.addEventListener('scroll', load);
        },

        buildScript: function(name) {
            var loadScript = document.createElement("script");
            loadScript.src = name;
            document.body.appendChild(loadScript);
        },

        buildStyleSheet: function(name, $this) {
            if (name == '') return;
            const loadStyleSheet = document.createElement("link");
            loadStyleSheet.rel = 'stylesheet';
            loadStyleSheet.type = 'text/css';
            loadStyleSheet.href = name;
            $this.parentNode.insertBefore(loadStyleSheet, $this);
        },

        loaderProductBlock: function() {
            var productBlocks = $('[data-product-block]')

            if (productBlocks.length) {
                productBlocks.each((_, productBlock) => {
                    var isSlider = $(productBlock).attr('data-layout') === 'slider' 

                    if (isSlider) {
                        scoder.productBlockSilder($(productBlock))
                    }
                })  

                if(window.wishlist.show){
                    scoder.setLocalStorageProductForWishlist();
                }

                if (scoder.checkNeedToConvertCurrency()) {
                    Currency.convertAll(window.shop_currency, $('#currencies .active').attr('data-currency'), 'span.money', 'money_format');
                };
            }   
        },

        loaderRecommendationsBlock: function(){
            scoder.buildRecommendationBlock();
        },

        scrollToReview: function() {
            var $scope = $('.productView-tab');

            if($scope.length){
                $doc.on('click', '.productView-details .scoder-productReview', (event)  => {
                    event.preventDefault();

                    $('body,html').animate({
                        scrollTop: $scope.offset().top 
                    }, 1000);
                    var activeTab = $scope.find('[href="#tab-review"]');
                    var activeTabCustom = $scope.find('[href="#tab-customer-reviews"]');
                    var activeTabMb = $scope.find('[href="#tab-review-mobile"]');
                    var activeTabCustomMb = $scope.find('[href="#tab-customer-reviews-mobile"]');
                    if (!activeTab.hasClass('is-open') || !activeTabMb.hasClass('is-open') || !activeTabCustom.hasClass('is-open') || !activeTabCustomMb.hasClass('is-open')) {
                        activeTab[0]?.click();
                        activeTabMb[0]?.click();
                        activeTabCustom[0]?.click();
                        activeTabCustomMb[0]?.click();
                    }
                })
            }
        },

        headerdropdownCurrency: function() {
            if ($('.header-language_currency').length) {
                var curency_top = $('.dropdown-currency');
                $(document).on('click', '.header-language_currency .scoder-top-currency .currency-dropdown', function(e) {
                    if (!curency_top.is(e.target) && curency_top.has(e.target).length == 0){
                        curency_top.toggleClass('show');
                    }
                });
                $(".header-language_currency .scoder-top-currency .dropdown-menu .dropdown-item").on("click", function(){
                    curency_top.removeClass('show');
                });

                $(document).on('click', function(event) {
                    if (curency_top.hasClass('show') && ($(event.target).closest('.scoder-top-currency').length === 0)) {
                        curency_top.removeClass('show');
                    }
                });

                if($('.header').hasClass('header-03') || $('.header').hasClass('header-04') || $('.header').hasClass('header-05') || $('.header').hasClass('header-06') || $('.header').hasClass('header-07') || $('.header').hasClass('header-08') || $('.header').hasClass('header-12')){
                    $(document).on('click', '.header-language_currency', function(e) {
                        if($('.header').hasClass('header-06') || $('.header').hasClass('header-08') || $('.header').hasClass('header-07')){
                            if (!$('.top-language-currency').is(e.target) && $('.top-language-currency').has(e.target).length == 0){
                                $('.top-language-currency').toggleClass('show');
                            }
                        } else{
                            if (!$('.top-language-currency').is(e.target)){
                                $('.top-language-currency').toggleClass('show');
                            }
                        }
                    });
                    $(document).on('click', function(event) {
                        if (!$('.header-language_currency').is(event.target) && $('.header-language_currency').has(event.target).length == 0){
                            if ($('.top-language-currency').hasClass('show') && ($(event.target).closest('.top-language-currency').length === 0) && ($(event.target).closest('.header-language_currency').length === 0)) {
                                $('.top-language-currency').removeClass('show');
                            }
                        }
                    });
                }

            }
        },

        headerdropdownLanguage: function() {
            if ($('.header-language_currency').length) {
                $(document).on('click', '.header-language_currency .scoder-top-language', function(e) {
                    $('.dropdown-language').toggleClass('show');
                });

                $(document).on('click', '.header-language_currency .scoder-top-language .dropdown-menu .dropdown-item', function(e) {
                    $('.dropdown-language').removeClass('show');
                });

                $(document).on('click', function(event) {
                    if ($('.dropdown-language').hasClass('show') && ($(event.target).closest('.scoder-top-language').length === 0)) {
                        $('.dropdown-language').removeClass('show');
                    }
                });
            }
        },

         headerSidebarSearch: function() {
            var headerSearchPC = $('.header-top .header__search .search_details'),
                headerSearchMB = $('#search-form-mobile .scoder-sidebar-wrapper .search_details'),
                headerwraperSearchPC = $('.header-top .header__search'),
                headerwraperSearchMB = $('#search-form-mobile .scoder-sidebar-wrapper'),
                searchDetails = $('.search_details'),
                predictiveSearchPC =  $('.header-top .header__search predictive-search'),
                predictiveSearchMB = $('#search-form-mobile .scoder-sidebar-wrapper predictive-search');
 
             if (predictiveSearchPC.length === 0) predictiveSearchPC =  $('.header-top .header__search .search_details');
             if (predictiveSearchMB.length === 0) predictiveSearchMB =  $('#search-form-mobile .scoder-sidebar-wrapper .search_details');
            if ($(window).width() < 1025) {
                if($('.header').hasClass('header-01')){
                    predictiveSearchPC.appendTo(headerwraperSearchMB);
                }
                searchDetails.attr('open','true');
                $('[data-search-mobile]').on('click', (event) => {
                    event.preventDefault();
                    $('body').addClass('open_search_mobile');
                });
                $('[data-search-close-sidebar], .background-overlay').on('click', (event) => {
                    event.preventDefault();
                    $('body').removeClass('open_search_mobile');
                });
            }else{
                if($('.header').hasClass('header-01')){
                    predictiveSearchMB.appendTo(headerwraperSearchPC);
                }
                searchDetails.removeAttr('open');
                $(document).on('click', (event) =>{
                    if($('body').hasClass('open_search') && !$('.header').hasClass('header-02') && ($(event.target).closest('.header__search').length === 0)){
                        $('body').removeClass('open_search');
                        $('.search_details').removeAttr('open');
                    }   
                }); 
                $('.search-modal__close-button').on('click', (event) => {
                    $('.search_details').removeAttr('open');
                });

                if($('.header').is('.header-02, .header-10, .header-11, .header-12')) {
                    searchDetails.attr('open','true'); 
                    $('[data-search-desktop]').on('click', (event) => {
                        event.preventDefault();
                        $('body').addClass('open_search_desktop');
                    });
                    $('[data-search-close-popup], .background-overlay').on('click', (event) => {
                        event.preventDefault();
                        $('body').removeClass('open_search_desktop');
                    });
                }
                
            }
        },

        initMultiTab: function() {
            if($('[data-menu-tab]').length > 0){
                $doc.on('click', '[data-menu-tab] li', (event) => {
                    var active = $(event.currentTarget).data('load-page'),
                        href= $(event.currentTarget).attr('href');

                    $.cookie('page-url', active, {
                        expires: 1,
                        path: '/'
                    });
                });

                var canonical = $('[canonical-shop-url]').attr('canonical-shop-url'),
                    pageUrl = $.cookie('page-url'),
                    menuTabItem,
                    logoTabItem;

                if ((window.location.pathname.indexOf('/pages/') !== -1) && window.page_active && (window.page_active != pageUrl))  {
                    setCookie('page-url', window.page_active, 1);
                    pageUrl = window.page_active;
                }

                if (document.URL != canonical) {
                    if(pageUrl != null){
                        menuTabItem = $(`[data-load-page="${pageUrl}"]`);
                        logoTabItem = $(`[data-load-logo-page="${pageUrl}"]`);
                    } else{
                        menuTabItem = $('[data-load-page].is-active');
                        logoTabItem = $('[data-load-logo-page].first');
                    }

                    var menuTab = menuTabItem.closest('[data-menu-tab]');

                    menuTabItem.addClass('is-active');
                    menuTab.find('[data-load-page]').not(menuTabItem).removeClass('is-active');
                    logoTabItem.addClass('is-active');
                    logoTabItem.siblings().removeClass('is-active');
                }

                var active = $('[data-menu-tab] li.is-active').data('load-page'),
                    check = false,
                    url = window.routes.root + `/search?type=product&q=${active}&view=ajax_mega_menu`;
              
                if($body.hasClass('template-index')){
                    if ($win.width() < 1025) {
                        if(window.mobile_menu == 'default'){
                            window.addEventListener('load', () => {
                                document.body.addEventListener('touchstart', () => {
                                    if (check == false) {
                                        check = true;
                                    }
                                }, false)
                            }, false);
                        } else {
                            window.addEventListener('load', () => {
                                document.body.addEventListener('touchstart', () => {
                                    if (check == false) {
                                        check = true;
                                        scoder.initMultiTabMobile();
                                    }
                                }, false)
                            }, false);
                        }
                    } else {
                        $doc.on('mousemove', () => {
                            if (check == false) {
                                check = true;
                            }
                        });
                    }
                } else {
                    if ($win.width() < 1025) {
                        if(window.mobile_menu == 'default'){
                            document.body.addEventListener('touchstart', () => {
                                if (check == false) {
                                    check = true;
                                }
                            }, false)
                        } else {
                            window.addEventListener('load', () => {
                                document.body.addEventListener('touchstart', () => {
                                    if (check == false) {
                                        check = true;
                                        scoder.initMultiTabMobile();
                                    }
                                }, false)
                            }, false);
                        }
                    } else {
                        if (check == false) {
                            check = true;
                        }
                    }
                }

            } else {
                var check = false,
                    url = window.routes.root + '/search?view=ajax_mega_menu';

                if ($win.width() < 1025) {
                    if (window.mobile_menu == "default") {
                        window.addEventListener("load",() => {
                                document.body.addEventListener("touchstart",() => {
                                        if (check == false) {
                                            check = true;
                                        }
                                    },false
                                );
                            },false
                        );
                    } else {
                        window.addEventListener("load",() => {
                                document.body.addEventListener("touchstart",() => {
                                        if (check == false) {
                                            check = true;
                                            scoder.initMultiTabMobile();
                                        }
                                    },false
                                );
                            },false
                        );
                    }
                }
            }
        },

        initMultiTabMobile: function() {
            if ($win.width() < 1025) {
                if(window.mobile_menu == 'custom'){
                    var chk = false,
                        menuElement = $('[data-section-type="menu"]'),
                        menuMobile = $('[data-navigation-mobile]'),
                        menuTabMobile = $('[data-navigation-tab-mobile]');

                        document.body.addEventListener('touchstart', () => {
                            if (chk == false) {
                                chk = true;
                                const content = document.createElement('div');
                                const tab = document.createElement('ul');
                                
                                Object.assign(tab, {
                                    className: 'menu-tab list-unstyled'
                                });
                                
                                tab.setAttribute('role', 'menu');
                                
                                menuElement.each((index, element) => {
                                    var currentMenu = element.querySelector('template').content.firstElementChild.cloneNode(true);
                                    
                                    if(index == 0){
                                        currentMenu.classList.add('is-visible'); 
                                    } else {
                                        currentMenu.classList.add('is-hidden');
                                    }
                                    
                                    content.appendChild(currentMenu);
                                });

                                content.querySelectorAll('[id^="MenuMobileListSection-"]').forEach((element, index) => {
                                    var tabTitle = element.dataset.heading,
                                        tabId = element.getAttribute('id'),
                                        tabElement = document.createElement('li');

                                    Object.assign(tabElement, {
                                        className: 'item'
                                    });

                                    tabElement.setAttribute('role', 'menuitem');

                                    if (index == 0) {
                                        tabElement.classList.add('is-active');
                                    }

                                    tabElement.innerHTML = `<a class="link" href="#" data-mobile-menu-tab data-target="${tabId}">${tabTitle}</a>`;

                                    tab.appendChild(tabElement);
                                });

                                menuTabMobile.html(tab);
                                menuMobile.html(content.innerHTML);
                            }
                        }, false);
                }
            }
        },

        productBlockSilder: function(wrapper) {
            var productGrid = wrapper.find('.products-carousel'),
                itemToShow = productGrid.data('item-to-show'),
                itemDots = productGrid.data('item-dots'),
                itemDotsMb = productGrid.data('item-dots-mb'),
                itemArrows = productGrid.data('item-arrows'),
                itemArrowsMb = productGrid.data('item-arrows-mb'),
                isProductCard06 = document.body.classList.contains('product-card-layout-06');

            if(productGrid.length > 0) {
                if(productGrid.hasClass('slick-initialized')) return;
                if(productGrid.not('.slick-initialized')) {
                    if (isProductCard06) {
                        productGrid.on('init', () => {
                            const selectOptionsHeight = productGrid.find('.product .card-action').eq(0).height();
                            productGrid.find('.slick-list').css('padding-bottom', selectOptionsHeight + 'px');
                            productGrid.attr('data-slider-padding-bottom', selectOptionsHeight)
                        })
                    }
                  
                    productGrid.slick({
                        mobileFirst: true,
                        adaptiveHeight: true,
                        vertical: false,
                        infinite: true,
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        arrows: itemArrowsMb,
                        dots: itemDotsMb,
                        nextArrow: window.arrows.icon_next,
                        prevArrow: window.arrows.icon_prev,
                        rtl: window.rtl_slick,
                        responsive: 
                        [
                            {
                                breakpoint: 1599,
                                settings: {
                                    arrows: itemArrows,
                                    dots: itemDots,
                                    get slidesToShow() {
                                        if(itemToShow !== undefined && itemToShow !== null && itemToShow !== ''){
                                            return this.slidesToShow = itemToShow;
                                        } else {
                                            return this.slidesToShow = 1;
                                        }
                                    },
                                    get slidesToScroll() {
                                        if(itemToShow !== undefined && itemToShow !== null && itemToShow !== ''){
                                            return this.slidesToScroll = itemToShow;
                                        } else {
                                            return this.slidesToScroll = 1;
                                        }
                                    }
                                }
                            },
                            {
                                breakpoint: 1024,
                                settings: {
                                    arrows: itemArrows,
                                    dots: itemDots,
                                    get slidesToShow() {
                                        if(itemToShow !== undefined && itemToShow !== null && itemToShow !== ''){
                                            if(itemToShow == 5 || itemToShow == 6){
                                                return this.slidesToShow = itemToShow - 1;
                                            } else {
                                                if (productGrid.parents('.collection-column-2').length){
                                                    return this.slidesToShow = 2;
                                                } else{
                                                    return this.slidesToShow = itemToShow;
                                                }
                                               
                                            }
                                        } else {
                                            return this.slidesToShow = 1;
                                        }
                                    },
                                    get slidesToScroll() {
                                        if(itemToShow !== undefined && itemToShow !== null && itemToShow !== ''){
                                            if(itemToShow == 5 || itemToShow == 6){
                                                return this.slidesToScroll = itemToShow - 1;
                                            } else {
                                                if (productGrid.parents('.collection-column-2').length){
                                                    return this.slidesToScroll = 2;
                                                } else{
                                                    return this.slidesToScroll = itemToShow;
                                                }
                                               
                                            }
                                        } else {
                                            return this.slidesToScroll = 1;
                                        }
                                    }
                                }
                            },
                            {
                                breakpoint: 991,
                                settings: {
                                    arrows: itemArrowsMb,
                                    dots: itemDotsMb,
                                    get slidesToShow(){
                                        if (productGrid.hasClass('has__banner_tab') || productGrid.parents('.product-block-has__banner').length){
                                            if (productGrid.parents('.product-block-has__banner').length && productGrid.parents('.product-block-has__banner').data('width-banner') > 40) {
                                                return this.slidesToShow = 2;
                                            }
                                            else {
                                                return this.slidesToShow = 3;
                                            }
                                        }
                                        else{
                                            if (productGrid.parents('.collection-column-2').length){
                                                return this.slidesToShow = 2;
                                            } else{
                                                return this.slidesToShow = 4;
                                            }
                                        }
                                    },
                                    get slidesToScroll(){
                                        if (productGrid.hasClass('has__banner_tab') || productGrid.parents('.product-block-has__banner').length){
                                            if (productGrid.parents('.product-block-has__banner').length && productGrid.parents('.product-block-has__banner').data('width-banner') > 40) {
                                                return this.slidesToScroll = 2;
                                            }
                                            else {
                                                return this.slidesToScroll = 3;
                                            }
                                        }
                                        else{
                                            if (productGrid.parents('.collection-column-2').length){
                                                return this.slidesToScroll = 2;
                                            } else{
                                                return this.slidesToScroll = 4;
                                            }
                                        }
                                    }
                                }
                            },
                            {
                                breakpoint: 767,
                                arrows: itemArrowsMb,
                                dots: itemDotsMb,
                                settings: {
                                    get slidesToShow(){
                                        if (productGrid.hasClass('has__banner_tab') || productGrid.parents('.product-block-has__banner').length){
                                            return this.slidesToShow = 2;
                                        }else{
                                            return this.slidesToShow = 3;
                                        }
                                    },
                                    get slidesToScroll(){
                                        if (productGrid.hasClass('has__banner_tab') || productGrid.parents('.product-block-has__banner').length){
                                            return this.slidesToScroll = 2;
                                        }else{
                                            return this.slidesToScroll = 3;
                                        }
                                    }
                                }
                            },
                            {
                                breakpoint: 320,
                                arrows: itemArrowsMb,
                                dots: itemDotsMb,
                                settings: {
                                    slidesToShow: 2,
                                    slidesToScroll: 2
                                }
                            }
                        ]
                    });

                    if (!wrapper.hasClass('ajax-loaded')) {

                    }
                }
            }
        },

        productBlockInfiniteScroll: function() {
            var productBlock = $('[data-product-block], [data-product-tab-block]');

            productBlock.each((index, element) => {
                var $block = $(element),
                    showMore = $block.find('[data-product-infinite]');
            
                if (showMore.length > 0) {
                    showMore.find('.button').on('click', (event) => {
                        var showMoreButton = $(event.target);

                        if (!showMoreButton.hasClass('view-all')) {
                            event.preventDefault();
                            event.stopPropagation();

                            // var text = window.button_load_more.loading;

                            showMoreButton.addClass('is-loading');
                            // showMoreButton.text(text);

                            var url = showMoreButton.attr('data-collection'),
                                limit = showMoreButton.attr('data-limit'),
                                swipe = showMoreButton.attr('data-swipe'),
                                total = showMoreButton.attr('data-total'),
                                image_ratio = showMoreButton.attr('data-image-ratio'),
                                sectionId = showMoreButton.attr('sectionId'),
                                page = parseInt(showMoreButton.attr('data-page'));

                            scoder.doProductBlockInfiniteScroll(url, total, limit, swipe, image_ratio, sectionId, page, showMoreButton, $block);
                        } else {
                            window.location = showMoreButton.data('href');
                        }
                    });
                }
            });
        },

        doProductBlockInfiniteScroll: function(url, total, limit, swipe, image_ratio, sectionId, page, showMoreButton, $block){
            $.ajax({
                type: 'get',
                url: window.routes.root + '/collections/' + url,
                cache: false,
                data: {
                    view: 'ajax_product_block',
                    constraint: 'limit=' + limit + '+page=' + page + '+sectionId=' + sectionId + '+imageRatio=' + image_ratio + '+swipe=' + swipe
                },
                beforeSend: function () {
                    // scoder.showLoading();
                },
                success: function (data) {
                    const $productGrid = showMoreButton.closest('.tab-content').length ? showMoreButton.closest('.tab-content').find('.products-grid') : showMoreButton.closest('.scoder-block-content').find('.products-grid');
                    let length = $productGrid.find('.product').length;
                    const res = scoder.handleResponse($(data), length, $productGrid.data('products-to-show'));
                    $productGrid.append(res);

                    if(length + res.length < $(data).length) {
                        var text = window.button_load_more.default;

                        showMoreButton.removeClass('is-loading');
                        showMoreButton.attr('data-page', page + 1);
                        showMoreButton.find('span').text(text);
                    } else {
                        if (Number(total) > $(data).length && $(data).length <= length + res.length) {
                            var text = window.button_load_more.view_all;

                            showMoreButton.find('span').text(text);
                            showMoreButton.removeClass('is-loading');
                            showMoreButton.attr('data-href', window.routes.root + '/collections/' + url).addClass('view-all');
                        } else {
                            var text = window.button_load_more.no_more;

                            showMoreButton.find('span').text(text);
                            showMoreButton.removeClass('is-loading');
                            showMoreButton.attr('disabled', 'disabled');
                        }
                    }
                },
                complete: function () {
                    // scoder.hideLoading();
                    if (scoder.checkNeedToConvertCurrency()) {
                        Currency.convertAll(window.shop_currency, $('#currencies .active').attr('data-currency'), 'span.money', 'money_format');
                    };

                    if (window.review.show && $('.shopify-product-reviews-badge').length > 0 && window.SPR != null && typeof window.SPR.registerCallbacks === 'functions') {
                        return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();
                    }
                }
            });
        },

        buildRecommendationBlock: function(){
            if (document.querySelector('[data-recommendations-block]') == null) return;

            var $this = document.querySelector('[data-recommendations-block]'),
                layout = $this.dataset.layout;
                swipe = $this.dataset.swipe;

            const config = {
                rootMargin: '1000px'
            }

            const handleIntersection = (entries, observer) => {
                const recommendationsContainer = $this.querySelector('.wrapper-container');
                if (!entries[0].isIntersecting) return;
                if ($this.innerHTML.trim() != '' && !recommendationsContainer.classList.contains('product-recommendations-loading') && !recommendationsContainer.classList.contains('has-product')) return;
                recommendationsContainer.classList.add('has-product');

                fetch($this.dataset.url)
                .then(response => response.text())
                .then(text => {
                    const html = document.createElement('div');
                    html.innerHTML = text;
                    const recommendations = html.querySelector('[data-recommendations-block]');
                    if (recommendations && recommendations.innerHTML.trim().length) {
                        $this.innerHTML = recommendations.innerHTML;

                        var productItems = $($this).find('.product-item')
                        var firstProductData = productItems.eq(0).data('json-product')
                        if (!firstProductData) return $($this).remove();

                        if (layout == 'slider') {
                            scoder.productBlockSilder($($this));
                        } else if (layout == 'scroll') {
                            const enableHover = $($this).find('[data-enable-hover]').attr('data-enable-hover')
                            const wrapper = $this.closest('.products-flex');

                            if (enableHover === 'true' && wrapper.clientWidth < wrapper.scrollWidth) {
                                scoder.productBlockScroller($($this));
                            }
                        }

                        var productItems = $($this).find('.product-item')
                        productItems.each(async (index, rawProduct) => {
                            var product = $(rawProduct);
                            var productId = product.data('product-id');
                            var productJson = product.data('json-product');
                            var handle = productJson.handle
                            
                            await  $.ajax({
                                type: 'get',
                                url: window.routes.root + '/products/' + handle + '?view=ajax_variant_quantity',
                                beforeSend: function () {},
                                success: function (data) {
                                    const element = new DOMParser().parseFromString(data, 'text/html')
                                    if (element.querySelector(`[data-quantity-product-id="${productId}"]`)) {
                                        const quantityInfo = JSON.parse(element.querySelector(`[data-quantity-product-id="${productId}"]`).innerHTML)
                                        window[`quick_view_inven_array_${productId}`] = quantityInfo
                                    }
                                },      
                                error: function (xhr, text) {
                                    scoder.showWarning($.parseJSON(xhr.responseText).description);
                                },
                                complete: function () {}
                            });
                        }) 

                        const loadingImages = $this.querySelectorAll('.media--loading-effect img');
                        this.observeImageLazyloaded(loadingImages);

                        if(window.compare.show){
                            var $compareLink = $('a[data-compare-link]');

                            scoder.setLocalStorageProductForCompare($compareLink);
                        }

                        if(window.wishlist.show){
                            scoder.setLocalStorageProductForWishlist();
                        }

                        if (window.review.show && $('.shopify-product-reviews-badge').length > 0) {
                            return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();
                        }

                        this.calculateTranslateYHeight()
                    }
                })
                .catch(e => {
                    console.error(e);
                });
            }

            new IntersectionObserver(handleIntersection.bind($this), ({}, config)).observe($this);
        },

        initVideoPopup: function (){
            if ($(".video-open-popup, .video-button").length) {
            } else {return}
            $('.video-open-popup .video-button, .video-button button').off('click').on('click',function(){
                let video_type = $(this).attr('data-type'),
                    video_src = $(this).attr('data-src'),
                    aspect_ratio = $(this).attr('aspect_ratio'),
                    modal = $('[data-popup-video]');

                const $content = `<div class="fluid-width-video-wrapper" style="padding-top: ${aspect_ratio}">
                                    ${video_type == 'youtube' ? 
                                        `<iframe
                                            id="player"
                                            type="text/html"
                                            width="100%"
                                            frameborder="0"
                                            webkitAllowFullScreen
                                            mozallowfullscreen
                                            allowFullScreen
                                            src="https://www.youtube.com/embed/${video_src}?autoplay=1&mute=1">
                                        </iframe>`
                                        :
                                        `<iframe 
                                            src="https://player.vimeo.com/video/${video_src}?autoplay=1&mute=1" 
                                            class="js-vimeo" 
                                            allow="autoplay; 
                                            encrypted-media" 
                                            webkitallowfullscreen 
                                            mozallowfullscreen 
                                            allowfullscreen">
                                        </iframe>`
                                    }
                                </div>`;
                modal.find('.scoder-popup-content').html($content);
                $body.addClass('video-show');
            });

            $('[data-popup-video], [data-popup-video] .scoder-popup-close, .background-overlay').on('click', function (e) {
                let modalContent = $('[data-popup-video] .scoder-popup-content');
                if (!modalContent.is(e.target) && !modalContent.has(e.target).length) {
                    $body.removeClass('video-show');
                    $('[data-popup-video] iframe').remove();
                };
            });
        },

        initGlobalCheckbox: function() {
            $doc.on('change', '.global-checkbox--input', (event) => {
                var targetId = event.target.getAttribute('data-target');

                if(event.target.checked){
                    $(targetId).attr('disabled', false);
                } else{
                    $(targetId).attr('disabled', true);
                }
            });

            $doc.on('click', '[data-term-condition]', (event) => {
                event.preventDefault();
                event.stopPropagation();
                $body.addClass('term-condition-show');
            });

            $doc.on('click', '[data-close-term-condition-popup]', (event) => {
                event.preventDefault();
                event.stopPropagation();
                $body.removeClass('term-condition-show');
            });

            $doc.on('click', (event) => {
                setTimeout(() => {
                    if ($body.hasClass('cart-sidebar-show')) {
                        if (($(event.target).closest('[data-term-condition-popup]').length === 0)){
                            $body.removeClass('term-condition-show');
                        }
                    }
                    if ($body.hasClass('term-condition-show')) {
                        if ($(event.target).closest('[data-term-condition-popup]').length === 0){
                            $body.removeClass('term-condition-show');
                        }
                    }
                }, 10);
            });
        },
        
        initColorSwatch: function() {
            $doc.ready(function() {
                $('.card .swatch-label.is-active').trigger('click');
            });
            
            $doc.on('click', '.card .swatch-label', (event) => {
                var $target = $(event.currentTarget),
                    title = $target.attr('title').replace(/^\s+|\s+$/g, ''),
                    product = $target.closest('.product-item'),
                    productJson = product.data('json-product'),
                    productTitle = product.find('.card-title'),
                    productAction = product.find('[data-btn-addtocart]'),
                    variantId = $target.data('variant-id'),
                    productHref = product.find('a').attr('href'),
                    oneOption = $target.data('with-one-option'),
                    newImage = $target.data('variant-img'),
                    mediaList = []; 

                $target.parents('.swatch').find('.swatch-label').removeClass('is-active');
                $target.addClass('is-active');
                
                if(productTitle.hasClass('card-title-change')){
                    if($body.hasClass('style_2_text_color_varriant')){
                        productTitle.find('[data-change-title]').text(title);
                    }else{
                        productTitle.find('[data-change-title]').text(' - ' + title);
                    }
                } else {
                    if($body.hasClass('style_2_text_color_varriant')){
                        productTitle.addClass('card-title-change').append('<span data-change-title>' + title + '</span>');
                    }else{
                        productTitle.addClass('card-title-change').append('<span data-change-title> - ' + title + '</span>');
                    }
                }

                const selectedVariant = productJson.variants.find(variant => variant.id === variantId)

                if (selectedVariant.compare_at_price > selectedVariant.price) {
                    product.find('.price').addClass('price--on-sale');
                    product.find('.price__sale .price-item--regular').html(Shopify.formatMoney(selectedVariant.compare_at_price, window.money_format));
                    product.find('.price__sale .price-item--sale').html(Shopify.formatMoney(selectedVariant.price, window.money_format));
                    const labelSale = `-${Math.round((selectedVariant.compare_at_price - selectedVariant.price) * 100 / selectedVariant.compare_at_price)}%`;
                    product.find('.price__label_sale .label_sale').html(labelSale);
                } else {
                    product.find('.price__regular .price-item').html(Shopify.formatMoney(selectedVariant.price, window.money_format));

                    if (selectedVariant.compare_at_price == null) {
                        product.find('.price').removeClass('price--on-sale');
                        product.find('.price__sale .price-item--regular').html('');
                    }
                }
  
                product.find('a:not(.single-action):not(.number-showmore)').attr('href', productHref.split('?variant=')[0]+'?variant='+ variantId);

                if (oneOption != undefined) {
                    var quantity = $target.data('quantity');
                    var addToCartIcon = "<svg version='1.1' id='OBJECTS' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px'viewBox='0 0 383.7 380.1' enable-background='new 0 0 383.7 380.1' xml:space='preserve'><g><path fill='#222222' d='M380.4,97.2c-3-3.8-7.5-6-12.3-6H88.5L69,12c-1.7-7-8-12-15.2-12H15.6C7,0,0,7.1,0,15.8c0,8.7,7,15.8,15.6,15.8h26l64.2,261.3c0.4,1.8,1.2,3.4,2.1,4.9c0.6,0.9,1.4,1.6,2.2,2.4c0.4,0.4,0.8,1,1.3,1.4c1.2,1,2.6,1.7,4.1,2.3c0.1,0.1,0.2,0.2,0.2,0.2c1.8,0.6,3.5,0.9,5.3,0.9l0.1,0h202.3c7.2,0,13.4-4.9,15.2-12l44.7-182.1C384.4,106,383.4,101.1,380.4,97.2z M311.1,273.3h-178l-37-150.5h251.9L311.1,273.3z'/><path fill='#222222' d='M135.4,327.8L135.4,327.8c-14.3,0-25.9,11.7-25.9,26.1c0,14.4,11.6,26.1,25.9,26.1h0c14.3,0,25.9-11.7,25.9-26.1C161.3,339.5,149.7,327.8,135.4,327.8z'/><path fill='#222222' d='M308.9,327.8L308.9,327.8c-14.3,0-25.9,11.7-25.9,26.1c0,14.4,11.6,26.1,25.9,26.1h0c14.3,0,25.9-11.7,25.9-26.1C334.8,339.5,323.2,327.8,308.9,327.8z'/></g></svg>";
                  
                    product.find('[name="id"]').val(oneOption);
  
                    if (quantity > 0) {
                        if(window.notify_me.show){
                            productAction
                                .removeClass('is-notify-me')
                                .addClass('is-visible');
                        } else {
                            productAction
                                .removeClass('is-soldout')
                                .addClass('is-visible');
                        }
                    } else {
                       if(window.notify_me.show){
                            productAction
                                .removeClass('is-visible')
                                .addClass('is-notify-me');
                        } else {
                            productAction
                                .removeClass('is-visible')
                                .addClass('is-soldout');
                        }
                    }

                    if(productAction.hasClass('is-soldout') || productAction.hasClass('is-notify-me')){
                        if(productAction.hasClass('is-notify-me')){
                            productAction.text(window.notify_me.button);
                        } else {
                            productAction
                                .text(window.variantStrings.soldOut)
                                .prop('disabled', true);
                        }
                    } else {
                        productAction
                            .html(window.variantStrings.addToCart + addToCartIcon)
                            .prop('disabled', false);
                    }
                } else {
                    if (productJson != undefined) {
                        if(window.quick_shop.show){
                            scoder.checkStatusSwatchQuickShop(product, productJson);
                        }
                    }

                    product.find('.swatch-element[data-value="' + title + '"]').find('.single-label').trigger('click');
                }

                if (productJson.media != undefined) {
                    var mediaList = productJson.media.filter((index, element) => {
                        return element.alt === title;
                    });
                }

                if (mediaList.length > 0) {
                    if (mediaList.length > 1) {
                        var length = 2;
                    } else {
                        var length = mediaList.length;
                    }
                    
                    for (var i = 0; i < length; i++) {
                        product.find('.card-media img:eq('+ i +')').attr('srcset', mediaList[i].src);
                    }
                } else {
                    if (newImage) {
                        product.find('.card-media img:nth-child(1)').attr('srcset', newImage);
                    }
                }
  
                if (scoder.checkNeedToConvertCurrency()) {
                    Currency.convertAll(window.shop_currency, $('#currencies .active').attr('data-currency'), 'span.money', 'money_format');
                }
            });
              
            $doc.on('click', '.item-swatch-more .number-showmore', (event) => {
                if ($(event.target).closest('.swatch').hasClass('show--more')) {
                    $(event.target).closest('.swatch').removeClass('show--more');
                    $(event.target).closest('.swatch').find('.number-showmore span:eq(0)').text('+');
                } else {
                    $(event.target).closest('.swatch').addClass('show--more');
                    $(event.target).closest('.swatch').find('.number-showmore span:eq(0)').text('-'); 
                }
            })
        },

        checkPreOrderOfVariant: function(selectedVariant, productAction, productJson) {
            const variantId = selectedVariant.id
            const updatePreOrderText = (productAction, selectedVariant, inventoryQuantity) => {
                const product = productAction.parents('.product-item');
                const hasQuickShopPanel = product.find('[data-quickshop-popup]').length > 0;

                if (selectedVariant.available && inventoryQuantity <=0 ) {
                    productAction
                        .text(window.variantStrings.preOrder)
                        .prop('disabled', false)
                        .addClass('button--preorder');
                } else {
                    productAction.removeClass('button--preorder');
                  if (inventoryQuantity > 0) {
                        if(window.notify_me.show){
                            productAction
                                .removeClass('is-notify-me')
                                .addClass('is-visible')
                        } else {
                            productAction
                                .removeClass('is-soldout')
                                .addClass('is-visible')
                        }
                    } else {
                      
                       if(window.notify_me.show){
                            productAction
                                .removeClass('is-visible')
                                .addClass('is-notify-me')
                                .prop('disabled', false);
                        } else {
                            productAction
                                .removeClass('is-visible')
                                .addClass('is-soldout').prop('disabled', true);
                        }
                    }

                    if(productAction.hasClass('is-soldout') || productAction.hasClass('is-notify-me')){
                        if(productAction.hasClass('is-notify-me')){

                            productAction.text(window.notify_me.button).prop('disabled', false).removeClass('btn-unavailable');;
                        } else {
                            productAction
                                .text(window.variantStrings.soldOut)
                                .prop('disabled', true);
                        }
                    } else {
                        productAction
                            .text(hasQuickShopPanel ? window.variantStrings.add : window.variantStrings.addToCart)
                            .prop('disabled', false);
                    }
                }
            }
    
            const variantsQuantityInvenText = `quick_view_inven_array_${productJson.id}`
            var arrayInVarName = variantsQuantityInvenText,
                inven_array = window[arrayInVarName]; 
            
            if(inven_array != undefined) {
                var inven_num = inven_array[variantId],
                    inventoryQuantity = parseInt(inven_num);
                    updatePreOrderText(productAction, selectedVariant, inventoryQuantity)
            } else {
                $.ajax({
                    type: 'get',
                    url: window.routes.root + '/products/' + productJson.handle + '?view=ajax_quick_shop_data',
                    beforeSend: function () {},
                    success: function (data) {
                        window[variantsQuantityInvenText] = JSON.parse(data.split('=')[1])
                        var inven_num = window[variantsQuantityInvenText][variantId],
                            inventoryQuantity = parseInt(inven_num);
                        updatePreOrderText(productAction, selectedVariant, inventoryQuantity)   
                    },      
                    error: function (xhr, text) {
                        scoder.showWarning($.parseJSON(xhr.responseText).description);
                    },
                    complete: function () {
                        
                    }
                });
            }
        },

        initQuickShop: function() {
            if(window.quick_shop.show) {
                $doc.on('click', '[data-quickshop-popup]', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    
                    var $target = $(event.target),
                        product = $target.parents('.product-item'),
                        productJson = product.data('json-product'),
                        variantPopup = product.find('.variants-popup');
                    const $quickView = document.querySelector('.scoder-quick-view-popup');
                    if (!document.body.matches('.qv-loaded', '.qs3-loaded') && $quickView) {
                        scoder.buildStyleSheet($quickView.dataset.urlStyleProduct, $quickView);
                        document.body.classList.add('qs3-loaded');
                    }

                    if(!product.hasClass('quickshop-popup-show')){
                        $('.product-item').removeClass('quickshop-popup-show');

                        if ($body.hasClass('quick_shop_option_2')) {
                            var height = product.find('.card-media').outerHeight(true);
                            var variantsArray = variantPopup.find('.variants')

                            if ($body.hasClass('product-card-layout-02')){
                                if ($win.width() > 1024) {
                                    variantsArray.css('max-height', (height - 114) + 'px');
                                    variantsArray.css('min-height', (height - 114) + 'px');
                                } else {
                                    variantsArray.css('max-height', (height - 70) + 'px');
                                    variantsArray.css('min-height', (height - 70) + 'px');
                                } 
                            } else if ($body.hasClass('product-card-layout-04')){
                                if ($win.width() > 1024) {
                                    variantsArray.css('max-height', (height - 116) + 'px');
                                    variantsArray.css('min-height', (height - 116) + 'px');
                                } else {
                                    variantsArray.css('max-height', (height - 70) + 'px');
                                    variantsArray.css('min-height', (height - 70) + 'px');
                                } 
                            } else {
                                if ($win.width() > 1024) {
                                    variantsArray.css('max-height', (height - 74) + 'px');
                                    variantsArray.css('min-height', (height - 74) + 'px');
                                } else {
                                    variantsArray.css('max-height', (height - 20) + 'px');
                                    variantsArray.css('min-height', (height - 20) + 'px');
                                } 
                            }

                            if (variantsArray[0].scrollHeight > variantsArray[0].clientHeight) {
                                variantsArray.addClass('scrollable')
                            }

                            if (!$('.productListing').hasClass('productList')){
                                scoder.appendProductQuickShopOption2(product);
                            }
                        } else if ($body.hasClass('quick_shop_option_3')) {
                            const handle = $target.data('product-handle');
                                scoder.updateContentQuickshopOption3(handle);
                            
                            $doc.on('click', '[data-close-quick-shop-popup]', (event) => {
                                event.preventDefault();
                                event.stopPropagation();
                
                                $body.removeClass('quickshop-popup-show');
                            });
                            
                            $doc.off('click.quickShopOverlay').on('click.quickShopOverlay', (event) => {
                                if ($body.hasClass('quickshop-popup-show')) {
                                    if (($(event.target).closest('[data-quickshop-popup-option-3]').length === 0)){
                                        $body.removeClass('quickshop-popup-show');
                                    }
                                }
                            })
                        } 

                        if (!$body.hasClass('quick_shop_option_3')) {
                            if ($win.width() < 767) {
                                if ($('.productListing').hasClass('productList')) {
                                    scoder.appendToListViewModal(product)
                                } else {
                                    product.addClass('quickshop-popup-show');
                                }
                            } else {
                                product.addClass('quickshop-popup-show');
                            }
                        } else {
                            if ($('.productListing').hasClass('productList')){
                                if ($win.width() < 767) {
                                    scoder.appendToListViewModal(product)
                                } else {
                                    product.addClass('quickshop-popup-show');
                                }
                            }
                        }
                        
                        product.find('.swatch-label.is-active').trigger('click');
                        scoder.checkStatusSwatchQuickShop(product, productJson);
                        
                        if($body.hasClass('quick_shop_option_2') || ($('productListing').hasClass('productList') && !$('.card-swatch').hasClass('quick_shop_type_3'))){
                            if ($win.width() < 767) {
                                if (!$('.productListing').hasClass('productList')){
                                    var quickshopVariantPopup = $('#scoder-card-mobile-popup .variants-popup');
                                    quickshopVariantPopup.find('.selector-wrapper').each((index, element) => {
                                        $(element).find('.swatch-element:not(.soldout):not(.unavailable)').eq('0').find('.single-label').trigger('click');
                                    });
                                } else {
                                    variantPopup.find('.selector-wrapper').each((index, element) => {
                                        $(element).find('.swatch-element:not(.soldout):not(.unavailable)').eq('0').find('.single-label').trigger('click');
                                    });
                                }
                            } else {
                                variantPopup.find('.selector-wrapper').each((index, element) => {
                                    $(element).find('.swatch-element:not(.soldout):not(.unavailable)').eq('0').find('.single-label').trigger('click');
                                });
                            }
                            if (!$('.productListing').hasClass('productList')){
                                $body.addClass('quick_shop_popup_mobile');
                            }
                        } else {
                            variantPopup.find('.selector-wrapper:not(.option-color)').each((index, element) => {
                                $(element).find('.swatch-element:not(.soldout):not(.unavailable)').eq('0').find('.single-label').trigger('click');
                            });
                        }
                    } else {
                        scoder.initAddToCartQuickShop($target, variantPopup);
                    }

                    if (scoder.checkNeedToConvertCurrency()) {
                        Currency.convertAll(window.shop_currency, $('#currencies .active').attr('data-currency'), 'span.money', 'money_format');
                    }
                });

                $doc.on('click', '[data-cancel-quickshop-popup]', (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    var $target = $(event.currentTarget),
                        product = $target.parents('.product-item'),
                        quickshopMobilePopup = $doc.find('#scoder-card-mobile-popup');

                    product.removeClass('quickshop-popup-show');
                    var productQuickshopShown = $doc.find('.quickshop-popup-show')
                    productQuickshopShown.removeClass('quickshop-popup-show');
                    $body.removeClass('quickshop-list-view-show');
                     
                    if($body.hasClass('quick_shop_option_2')){
                        $body.removeClass('quick_shop_popup_mobile');
                        quickshopMobilePopup.removeClass('show');
                    }
                });

                $doc.on('click', (event) => {
                    if ($(event.target).closest('[data-quickshop-popup]').length === 0 && $(event.target).closest('.variants-popup').length === 0 && $(event.target).closest('.card-swatch').length === 0 && $(event.target).closest('[data-warning-popup]').length === 0) {
                        $('.product-item').removeClass('quickshop-popup-show');
                        if($body.hasClass('quick_shop_option_2')){
                            $body.removeClass('quick_shop_popup_mobile');
                        }
                    }
                });

                scoder.changeSwatchQuickShop();
            }
        },
  
        appendToListViewModal: function(product)  {
            const quickshopMobilePopup = $doc.find('#list-view-popup');
            const quickshopForm = product.clone();
            quickshopMobilePopup.find('.scoder-popup-content').empty();
            quickshopMobilePopup.find('.scoder-popup-content').append(quickshopForm);

            const form = quickshopMobilePopup.find('[data-quickshop] .card-information .variants-popup form').eq('0');
            const mobilePopupId = form.attr('id') + '-mobile';
            const optionInputs = form.find('.single-option');
            const optionLabels = form.find('.single-label');
            const cardInfoWrapper = quickshopMobilePopup.find('.card-product')
            const variantsPopup = quickshopMobilePopup.find('.variants-popup')
            const submitBtn = quickshopMobilePopup.find('[data-btn-addtocart]')
            variantsPopup.removeClass("card-list__hidden")
            let clicked = {
                selected1: false,
                selected2: false,
                selected3: false
            } 

            form.attr('id', mobilePopupId);
            submitBtn.attr('data-form-id', submitBtn.attr('data-form-id') + '-mobile')

            optionInputs.each((index, optionInput) => {
                $(optionInput).attr('id', $(optionInput).attr('id') + '-mobile');
                $(optionInput).attr('name', $(optionInput).attr('name') + '-mobile');
            })

            optionLabels.each((index, optionLabel) => {
                $(optionLabel).attr('for', $(optionLabel).attr('for') + '-mobile');

                const swatchWrapper = $(optionLabel).closest('.selector-wrapper')
                const swatchElement = $(optionLabel).closest('.swatch-element')
                if (!swatchElement.hasClass('available')) return 
                
                if (swatchWrapper.hasClass('selector-wrapper-1') && !clicked.selected1) {
                    clicked.selected1 = true
                    $(optionLabel).trigger('click')
                } else if (swatchWrapper.hasClass('selector-wrapper-2') && !clicked.selected2) {
                    clicked.selected2 = true 
                    $(optionLabel).trigger('click')
                } else if (swatchWrapper.hasClass('selector-wrapper-3') && !clicked.selected3) {
                    clicked.selected3 = true
                    $(optionLabel).trigger('click')
                }
            })

            $body.addClass('quickshop-list-view-show');

            $('.background-overlay').off('click.closeListViewModal').on('click.closeListViewModal', () => {
                $body.removeClass('quickshop-list-view-show');
            })
        },

        changeSwatchQuickShop: function () {
            $doc.on('change', '[data-quickshop] .single-option', (event) => {
                
                var $target = $(event.target),
                    product = $target.parents('.product-item'),
                    productJson = product.data('json-product'),
                    productAction = product.find('[data-btn-addtocart]'),
                    variantList,
                    optionColor = product.find('.option-color').data('option-position'),
                    optionIndex = $target.closest('[data-option-index]').data('option-index'),
                    swatch = product.find('.swatch-element'),
                    thisVal = $target.val(),
                    selectedVariant,
                    productInput = product.find('[name=id]'),
                    selectedOption1 = product.find('.selector-wrapper-1').find('input:checked').val(),
                    selectedOption2 = product.find('.selector-wrapper-2').find('input:checked').val(),
                    selectedOption3 = product.find('.selector-wrapper-3').find('input:checked').val();

                if ($body.hasClass('quick_shop_option_2') && $('.productListing').hasClass('productList')) {
                    selectedOption1 = product.find('.selector-wrapper-1').eq('1').find('input:checked').val();
                } else {
                    if ($('.productListing').hasClass('productList') && $win.width() < 767) {
                        selectedOption1 = product.find('.selector-wrapper-1').eq('1').find('input:checked').val();
                        selectedOption2 = product.find('[data-option-index="1"]').eq('1').find('input:checked').val();
                    } else {
                        selectedOption1 = product.find('.selector-wrapper-1').eq('0').find('input:checked').val();
                    }
                }

                if (productJson != undefined) {
                    variantList = productJson.variants;
                }

                swatch.removeClass('soldout');
                swatch.find('input[type="radio"]').prop('disabled', false);

                switch (optionIndex) {
                    case 0:
                        var availableVariants = variantList.find((variant) => {
                            if (optionColor == 1) {
                                return variant.option2 == thisVal && variant.option1 == selectedOption2;
                            } else {
                                if (optionColor == 2) {
                                    return variant.option3 == thisVal && variant.option1 == selectedOption2;
                                } else {
                                    return variant.option1 == thisVal && variant.option2 == selectedOption2;
                                }
                            }
                        });

                        if(availableVariants != undefined){
                            selectedVariant =  availableVariants;
                        } else{
                            var altAvailableVariants = variantList.find((variant) => {
                                if (optionColor == 1) {
                                    return variant.option2 == thisVal;
                                } else {
                                    if (optionColor == 2) {
                                        return variant.option3 == thisVal;
                                    } else {
                                        return variant.option1 == thisVal;
                                    }
                                }
                            });

                            selectedVariant =  altAvailableVariants;
                        }

                        break;
                    case 1:
                        var availableVariants = variantList.find((variant) => {
                            if (optionColor == 1) {
                                return variant.option2 == selectedOption1 && variant.option1 == thisVal && variant.option3 == selectedOption2;
                            } else {
                                if (optionColor == 2) {
                                    return variant.option3 == selectedOption1 && variant.option1 == thisVal && variant.option2 == selectedOption2;
                                } else {
                                    return variant.option1 == selectedOption1 && variant.option2 == thisVal && variant.option3 == selectedOption2;
                                }
                            }
                        });

                        if(availableVariants != undefined){
                            selectedVariant =  availableVariants;
                        } else {
                            var altAvailableVariants = variantList.find((variant) => {
                                if (optionColor == 1) {
                                    return variant.option2 == selectedOption1 && variant.option1 == thisVal;
                                } else {
                                    if (optionColor == 2) {
                                        return variant.option3 == selectedOption1 && variant.option1 == thisVal;
                                    } else {
                                        return variant.option1 == selectedOption1 && variant.option2 == thisVal;
                                    }
                                }
                            });

                            selectedVariant =  altAvailableVariants;
                        }

                        break;
                    case 2:
                        var availableVariants = variantList.find((variant) => {
                            if (optionColor == 1) {
                                return variant.option2 == selectedOption1 && variant.option1 == selectedOption2 && variant.option3 == thisVal;
                            } else {
                                if (optionColor == 2) {
                                    return variant.option3 == selectedOption1 && variant.option1 == selectedOption2 && variant.option2 == thisVal;
                                } else {
                                    return variant.option1 == selectedOption1 && variant.option2 == selectedOption2 && variant.option3 == thisVal;
                                }
                            }
                        });

                        if(availableVariants != undefined){
                            selectedVariant =  availableVariants;
                        }

                        break;
                }
                            
                if (selectedVariant == undefined) {
                    return;
                }
                
                productInput.val(selectedVariant.id);
                var value = $target.val();
               

                
                $target.parents('.selector-wrapper').find('.form-label span').text(value);
                if (selectedVariant.available) {
                    product.find('[data-btn-addtocart]').removeClass('btn-unavailable');
                    product.find('[data-quickshop] quickshop-update-quantity').removeClass('disabled');
                    product.find('[data-btn-addtocart]').attr('data-available', 'true')
                      
                } else {
                    product.find('[data-btn-addtocart]').addClass('btn-unavailable');
                    product.find('[data-quickshop] quickshop-update-quantity').addClass('disabled');
                    product.find('[data-btn-addtocart]').attr('data-available', 'false')
                }

                if (scoder.checkNeedToConvertCurrency()) {
                    Currency.convertAll(window.shop_currency, $('#currencies .active').attr('data-currency'), 'span.money', 'money_format');
                };

                if (!$body.hasClass('quick_shop_option_2') && !$body.hasClass('quick_shop_option_3') && $win.width() < 767) {
                    
                } 

                scoder.checkStatusSwatchQuickShop(product, productJson);
                scoder.checkPreOrderOfVariant(selectedVariant, productAction, productJson);
            });
        },

        checkStatusSwatchQuickShop: function(product, productJson){
            var variantPopup = product.find('.card-variant'),
                variantList,
                productOption = product.find('[data-option-index]'),
                optionColor = product.find('.option-color').data('option-position'),
                selectedOption1 = product.find('[data-option-index="0"]').find('input:checked').val(),
                selectedOption2 = product.find('[data-option-index="1"]').find('input:checked').val(),
                selectedOption3 = product.find('[data-option-index="2"]').find('input:checked').val(),
                productId = product.data('product-id');

            
            if ($body.hasClass('quick_shop_option_2')) {
                var height = product.find('.card-media').outerHeight(true);
                if (selectedOption3 != undefined) {
                    if ($body.hasClass('product-card-layout-01')) {
                        if (height < 310) {
                            $('[data-quickshop]').addClass('active_option_3');
                        } else {
                            $('[data-quickshop]').removeClass('active_option_3');
                        }  
                    } else {
                        if (height < 370) {
                            $('[data-quickshop]').addClass('active_option_3');
                        } else {
                            $('[data-quickshop]').removeClass('active_option_3');
                        } 
                    }
                } else {
                    if ($win.width() > 1024) {
                        if ($body.hasClass('product-card-layout-05')) {
                            if (height < 350 && selectedOption2 != undefined) {
                                $('[data-quickshop]').addClass('active_option_3');
                            } else {
                                $('[data-quickshop]').removeClass('active_option_3');
                            }    
                        } else if ($body.hasClass('product-card-layout-01')) {
                            if (height < 310 && selectedOption2 != undefined) {
                                $('[data-quickshop]').addClass('active_option_3');
                            } else {
                                $('[data-quickshop]').removeClass('active_option_3');
                            }  
                        }else {
                            if (height < 370 && selectedOption2 != undefined) {
                                $('[data-quickshop]').addClass('active_option_3');
                            } else {
                                $('[data-quickshop]').removeClass('active_option_3');
                            }   
                        }
                    } else {
                        if ($body.hasClass('product-card-layout-01')) {
                            if (height < 310) {
                                if (selectedOption1 != undefined || selectedOption2 != undefined) {
                                    $('[data-quickshop]').removeClass('active_option_3');
                                } else {
                                    $('[data-quickshop]').addClass('active_option_3');
                                }
                            } else {
                                $('[data-quickshop]').removeClass('active_option_3');
                            }   
                        } else {
                            if (height < 370) {
                                if (selectedOption1 != undefined || selectedOption2 != undefined) {
                                    $('[data-quickshop]').removeClass('active_option_3');
                                } else {
                                    $('[data-quickshop]').addClass('active_option_3');
                                }
                            } else {
                                $('[data-quickshop]').removeClass('active_option_3');
                            }   
                        }
                    }
                }
            }

            if ($body.hasClass('quick_shop_option_2') && $('.productListing').hasClass('productList')) {
                selectedOption1 = product.find('[data-option-index="0"]').eq('1').find('input:checked').val();
            } else {
                if ($('.productListing').hasClass('productList') && $win.width() < 767) {
                    selectedOption1 = product.find('[data-option-index="0"]').eq('1').find('input:checked').val();
                    selectedOption2 = product.find('[data-option-index="1"]').eq('1').find('input:checked').val();
                } else {
                    selectedOption1 = product.find('[data-option-index="0"]').eq('0').find('input:checked').val();
                }
            }
            
            if (productJson != undefined) {
                variantList = productJson.variants;
            }

            productOption.each((index, element) => {
                var optionIndex = $(element).data('option-index'),
                    swatch = $(element).find('.swatch-element');

                switch (optionIndex) {
                    case 0: 
                        swatch.each((idx, elt) => {
                            var item = $(elt),
                                swatchVal = item.data('value');

                            var optionSoldout = variantList.find((variant) => {
                                if (optionColor == 1) {
                                    return variant.option2 == swatchVal && variant.available;
                                } else {
                                    if (optionColor == 2) {
                                        return variant.option3 == swatchVal && variant.available;
                                    } else {
                                        return variant.option1 == swatchVal && variant.available;
                                    }
                                }
                            });

                            var optionUnavailable = variantList.find((variant) => {
                                if (optionColor == 1) {
                                    return variant.option2 == swatchVal;
                                } else {
                                    if (optionColor == 2) {
                                        return variant.option3 == swatchVal;
                                    } else {
                                        return variant.option1 == swatchVal;
                                    }
                                }
                            });

                            if(optionSoldout == undefined){
                                if (optionUnavailable == undefined) {
                                    item.removeClass('soldout available').addClass('unavailable');
                                    item.find('input[type="radio"]').prop('checked', false);
                                } else {
                                    item
                                        .removeClass('unavailable available')
                                        .addClass('soldout')
                                        .find('.single-action')
                                        .attr('data-variant-id', optionUnavailable.title);
                                    item.find('input[type="radio"]').prop('disabled', false);
                                }
                            } else {
                                item.removeClass('soldout unavailable').addClass('available');
                                item.find('input[type="radio"]').prop('disabled', false);
                            }
                        });

                        break;
                    case 1:
                        swatch.each((idx, elt) => {
                            var item = $(elt),
                                swatchVal = item.data('value');

                            var optionSoldout = variantList.find((variant) => {
                                if (optionColor == 1) {
                                    return variant.option2 == selectedOption1 && variant.option1 == swatchVal && variant.available;
                                } else {
                                    if (optionColor == 2) {
                                        return variant.option3 == selectedOption1 && variant.option1 == swatchVal && variant.available;
                                    } else {
                                        return variant.option1 == selectedOption1 && variant.option2 == swatchVal && variant.available;
                                    }
                                }
                            });

                            var optionUnavailable = variantList.find((variant) => {
                                if (optionColor == 1) {
                                    return variant.option2 == selectedOption1 && variant.option1 == swatchVal;
                                } else {
                                    if (optionColor == 2) {
                                        return variant.option3 == selectedOption1 && variant.option1 == swatchVal;
                                    } else {
                                        return variant.option1 == selectedOption1 && variant.option2 == swatchVal;
                                    }
                                }
                            });

                            if(optionSoldout == undefined){
                                if (optionUnavailable == undefined) {
                                    item.removeClass('soldout available').addClass('unavailable');
                                    item.find('input[type="radio"]').prop('checked', false);
                                } else {
                                    item
                                        .removeClass('unavailable available')
                                        .addClass('soldout')
                                        .find('.single-action-selector')
                                        .attr('data-variant-id', optionUnavailable.title);
                                    item.find('input[type="radio"]').prop('disabled', false);
                                }
                            } else {
                                item.removeClass('soldout unavailable').addClass('available');
                                item.find('input[type="radio"]').prop('disabled', false);
                            }
                            
                        });
                        break;
                    case 2:
                        swatch.each((idx, elt) => {
                            var item = $(elt),
                                swatchVal = item.data('value');

                            var optionSoldout = variantList.find((variant) => {
                                if (optionColor == 1) {
                                    return variant.option2 == selectedOption1 && variant.option1 == selectedOption2 && variant.option3 == swatchVal && variant.available;
                                } else {
                                    if (optionColor == 2) {
                                        return variant.option3 == selectedOption1 && variant.option1 == selectedOption2 && variant.option2 == swatchVal && variant.available;
                                    } else {
                                        return variant.option1 == selectedOption1 && variant.option2 == selectedOption2 && variant.option3 == swatchVal && variant.available;
                                    }
                                }
                            });

                            var optionUnavailable = variantList.find((variant) => {
                                if (optionColor == 1) {
                                    return variant.option2 == selectedOption1 && variant.option1 == selectedOption2 && variant.option3 == swatchVal;
                                } else {
                                    if (optionColor == 2) {
                                        return variant.option3 == selectedOption1 && variant.option1 == selectedOption2 && variant.option2 == swatchVal;
                                    } else {
                                        return variant.option1 == selectedOption1 && variant.option2 == selectedOption2 && variant.option3 == swatchVal;
                                    }
                                }
                            });

                            if(optionSoldout == undefined){
                                if (optionUnavailable == undefined) {
                                    item.removeClass('soldout available').addClass('unavailable');
                                    item.find('input[type="radio"]').prop('checked', false);
                                } else {
                                    item
                                        .removeClass('unavailable available')
                                        .addClass('soldout')
                                        .find('.single-action-selector')
                                        .attr('data-variant-id', optionUnavailable.title);
                                    item.find('input[type="radio"]').prop('disabled', false);
                                }
                            } else {
                                item.removeClass('unavailable soldout').addClass('available');
                                item.find('input[type="radio"]').prop('disabled', false);
                            }
                        });

                        break;  
                }
            });

            variantPopup.find('.selector-wrapper:not(.option-color)').each((index, element) => {
                var item = $(element);

                if (item.find('.swatch-element').find('input:checked').length < 1) {
                    if (item.find('.swatch-element.available').length > 0) {
                        item.find('.swatch-element.available').eq('0').find('.single-label').trigger('click');
                    } else {
                        item.find('.swatch-element.soldout').eq('0').find('.single-label').trigger('click');
                    }
                }
            });

  
            if ($body.hasClass('quick_shop_option_2')) {
                var variantId = product.find('[data-quickshop]').eq(1).find('[name="id"]').val();
                var arrayInVarName = `quick_view_inven_array_${productId}`,
                    inven_array = window[arrayInVarName]; 
                  
                if(inven_array != undefined) {
                    var inven_num = inven_array[variantId],
                        inventoryQuantity = parseInt(inven_num),
                        quantityInput = product.find('input[name="quantity"]').eq(0);
                    
                    quantityInput.attr('data-inventory-quantity', inventoryQuantity);
                    if (quantityInput.val() > inventoryQuantity) {
                        if (inventoryQuantity > 0) {
                            quantityInput.val(inventoryQuantity)
                        } else {
                            quantityInput.val(1)
                        }
                    }
                }
            }
        },
        
        initAddToCartQuickShop: function($target, popup){
            var variantId = popup.find('[name="id"]').val(),
                qty = 1;

            scoder.actionAddToCart($target, variantId, qty);
            
        },

        initAddToCart: function() {
            console.log('initAddToCart');
            // AQUI ENTRA CUANOD PRESIONO EL BOTON AGREGAR AL CARRITO 
            $doc.off('click.addToCart').on('click.addToCart', '[data-btn-addtocart]', (event) => {

                event.preventDefault();
                event.stopPropagation();

                var $target = $(event.target),
                    product = $target.parents('.product-item'),
                    MobilePopup_Option_2 = $doc.find('#scoder-card-mobile-popup'),
                    ProductQuickShopShown_Option_2 = $doc.find('.quickshop-popup-show');
                if($target.closest('product-form').length > 0){
                    var productForm = $target.closest('form');
                    scoder.actionAddToCart2($target, productForm);
                } else {
                    
                    if(!$target.hasClass('is-notify-me') && !$target.hasClass('is-soldout')){
                        var form = $target.parents('form'),
                        variantId = form.find('[name="id"]').val(),
                        qty = form.find('[name="quantity"]').val(),
                        input = form.find('[name="quantity"]').eq(0),
                        submitButton = form.find('[type="submit"]'),
                        stockVariante = submitButton.data('productoVarianteStock');
                    
                        // console.log('Stock disponible:', stockVariante);
                        // console.log('variantId:', variantId);

                        
                        if(qty == undefined){
                            qty = 1;
                        }
                        scoder.actionAddToCart($target, variantId, qty, input);
                    } else if($target.hasClass('is-notify-me')){
                        scoder.notifyInStockPopup($target);
                    }
                }
            });
            
            $doc.on('click', '[data-close-add-to-cart-popup]', (event) => {
                event.preventDefault();
                event.stopPropagation();
                $body.removeClass('add-to-cart-show');
            });

            $doc.on('click', (event) => {
                if($body.hasClass('add-to-cart-show')){
                    if (($(event.target).closest('[data-add-to-cart-popup]').length === 0)) {
                        $body.removeClass('add-to-cart-show');
                    }
                }
            });
        },

        actionAddToCart: function($target, variantId, qty, input){
            var originalMessage = window.variantStrings.submit,
                waitMessage = window.variantStrings.addingToCart,
                successMessage = window.variantStrings.addedToCart;
            
            if($target.hasClass('button-text-change')){
                originalMessage = $target.text();
            }

            $target.addClass('is-loading');

            if($body.hasClass('quick-view-show')){
                // Ingresa aqui siempre
                // Verificar si el 'Cuerpo' ya existe en algun elemento debe ser igual
                // Si este existe, entonces se ChangeItem en el caso que no AddItem 
                Shopify.getCart(function(cart) {
                    const cuerpoGenerado = Shopify.jsonOpcionesSeleccionadas();
                    
                    const productoSimilar = cart.items.find(item => {
                        const cuerpoItemLimpio = typeof item.properties?.Cuerpo === 'string' 
                            ? item.properties.Cuerpo.replace(/\\/g, '')
                            : item.properties?.Cuerpo;
                            
                        return item.variant_id == variantId && cuerpoItemLimpio === cuerpoGenerado;
                    });

                    let enoughInStock = true;
                    const stockValue = document.querySelector('[data-producto-variante-stock]') 
                          ? parseFloat(document.querySelector('[data-producto-variante-stock]').getAttribute('data-producto-variante-stock')) 
                          : 0;
                    console.log('Valor del stockValue',stockValue);
                    console.log('Valor del qty',qty);

                    if(stockValue < qty){
                        enoughInStock = false;
                    }
                
                    
                    if(productoSimilar){
                        const productLine = productoSimilar.key;
                        console.log(productLine);
                        // 
                          Shopify.changeItemCustomCarrito(productLine, qty, (cart) => {
                                if (window.after_add_to_cart.type == 'cart') {
                                    console.log('Entro aqui 1')
                                    scoder.redirectTo(window.routes.cart);
                                } else {
                                    console.log('Entro aqui 2')

                                    Shopify.getCart((cartTotal) => {
                                    console.log('Entro aqui 3')

                                        $body.addClass('cart-sidebar-show');
                                        scoder.updateSidebarCart(cartTotal);
                                        $body.find('[data-cart-count]').text(cartTotal.item_count);
                                        $target.removeClass('is-loading');
                                        scoder.updateSidebarCart(cart);

                                    });
                                }
                              if($body.hasClass('template-cart')){
                                  scoder.updateCart(cart);
                                  console.log("template-cart");
                              } else if($body.hasClass('cart-modal-show')){
                                  console.log("cart-modal-show");
                                  scoder.updateSidebarCart(cart);
                              } else if($body.hasClass('cart-sidebar-show')) {
                                  console.log("cart-sidebar-show");
                                  scoder.updateSidebarCart(cart);

                                }
                              if (!enoughInStock) scoder.showWarning(`${ window.cartStrings.addProductOutQuantity.replace('[maxQuantity]', qty) }`)
                          });
                    }else{
                        console.log("Sera un producto nuevo");
                        console.log("qty" , qty);
                         Shopify.addItemCustomCarrito(variantId, qty, () => {
                             if (window.after_add_to_cart.type == 'cart') {
                                 scoder.redirectTo(window.routes.cart);
                             } else {
                                 Shopify.getCart((cartTotal) => {
                                     $body.addClass('cart-sidebar-show');
                                     scoder.updateSidebarCart(cartTotal);
                                     $body.find('[data-cart-count]').text(cartTotal.item_count);
                                     $target.removeClass('is-loading');
                                 });
                             }
                         }, input);
                    }
                
                });
            } else {
                console.log("Hola test 2",qty);
                Shopify.addItemCustomCarrito(variantId, qty, () => {
                    $target.removeClass('is-loading');
                    if ($body.hasClass('quickshop-popup-show') && $body.hasClass('quick_shop_option_3')) {
                        $body.removeClass('quickshop-popup-show');
                        
                        $('.quickshop-popup-show').removeClass('quickshop-popup-show');
                    }

                    if ($body.hasClass('quickshop-list-view-show')) {
                        $body.removeClass('quickshop-list-view-show')
                    }

                    if ($body.hasClass('show-mobile-options')) {
                        $body.removeClass('show-mobile-options');
                        $('.background-overlay').addClass('hold');
                    }

                    if ($body.hasClass('quick_shop_popup_mobile') && $body.hasClass('quick_shop_option_2')) {
                            $body.removeClass('quick_shop_popup_mobile');
                            $doc.find('#scoder-card-mobile-popup').removeClass('show');
                            $doc.find('.quickshop-popup-show').each((index, popup) => {
                                $(popup).removeClass('quickshop-popup-show');
                            })
                    }

                    switch (window.after_add_to_cart.type) {
                        case 'cart':
                            scoder.redirectTo(window.routes.cart);

                            break;
                        case 'quick_cart':
                            if(window.quick_cart.show){
                                Shopify.getCart((cart) => {
                                    if( window.quick_cart.type == 'popup'){
                                    } else {
                                        $body.addClass('cart-sidebar-show');
                                        scoder.updateSidebarCart(cart);
                                    }

                                    $target.removeClass('is-loading');
                                    $('.background-overlay').removeClass('hold');
                                });
                            } else {
                                scoder.redirectTo(window.routes.cart);
                            }

                            break;
                    }
                }, input);
            }
        },

        actionAddToCart2: function($target, productForm) {

            const config = fetchConfig('javascript');
            var originalMessage = window.variantStrings.submit,
                waitMessage = window.variantStrings.addingToCart,
                successMessage = window.variantStrings.addedToCart;
            
            if($target.hasClass('button-text-change')){
                originalMessage = $target.text();
            }

            $target.addClass('is-loading');

            let addToCartForm = document.querySelector('[data-type="add-to-cart-form"]');
            let formData = new FormData(addToCartForm);

            const properties = document.querySelectorAll('input[name^="properties"]')

            properties.forEach(property => {
              if (property.value == null) return;
                if (property.type == 'file') {
                  formData.append(property.name, property.files[0])
                } else {
                  formData.append(property.name, property.value)
                }
            })

            const enoughInStock = scoder.checkSufficientStock(productForm);
            if (!enoughInStock && $body.hasClass('quickshop-popup-show')) {
                alert(window.cartStrings.addProductOutQuantity);
                $target.removeClass('is-loading');
                return 
            }

            const addItemToCart = () => {
                fetch(window.Shopify.routes.root + 'cart/add.js', {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    return response.json();
                })
                .catch((error) => {
                    console.error('Error:', error);
                })
                .finally(() => {
                    if ($body.hasClass('quickshop-popup-show')) {
                        $body.removeClass('quickshop-popup-show');
                    }
    
                    if($body.hasClass('quick-view-show')){
                        if (window.after_add_to_cart.type == 'cart') {
                            scoder.redirectTo(window.routes.cart);
                        } else {
                            Shopify.getCart((cartTotal) => {
                                $body.find('[data-cart-count]').text(cartTotal.item_count);
                                $target.removeClass('is-loading');
                            });
                        }
                    } else {
                        switch (window.after_add_to_cart.type) {
                            case 'cart':
                                scoder.redirectTo(window.routes.cart);
                            
                                break;
                            case 'quick_cart':
                                if(window.quick_cart.show){
                                    Shopify.getCart((cart) => {
                                        if( window.quick_cart.type == 'popup'){
                                        } else {
                                            $body.addClass('cart-sidebar-show');
                                            scoder.updateSidebarCart(cart);
                                        }
                                        
                                        $target.removeClass('is-loading');
                                    });
                                } else {
                                    scoder.redirectTo(window.routes.cart);
                                }
                                
                                break;
                        }
                    }
                });
            }

            fetch(window.Shopify.routes.root + 'cart.js', {
                method: 'GET',
            })
            .then(response => {
                return response.json();
            }).then(response => { 
                const variantId = parseInt($(addToCartForm).serialize().split('id=')[1])
                const item = response.items.find(item => item.variant_id == variantId)
                const currentQuantity = item?.quantity 
                const currentProductId = item?.product_id
                const moreQuantity = parseInt(productForm.find('[data-inventory-quantity]').val()) 
                const maxQuantity = parseInt(productForm.find('[data-inventory-quantity]').data('inventory-quantity'))
                const saleOutStock = document.getElementById('product-add-to-cart').dataset.available === 'true' | false

                if (!currentQuantity || !maxQuantity || saleOutStock) return addItemToCart()
                var arrayInVarName = `selling_array_${currentProductId}`,
                itemInArray = window[arrayInVarName],
                itemStatus = itemInArray[variantId];
                if(itemStatus == 'deny') {
                  if (currentQuantity + moreQuantity > maxQuantity)  {
                      const remainingQuantity = maxQuantity - currentQuantity 
                      throw new Error(`You ${remainingQuantity > 0 ? `can only add ${remainingQuantity}` : 'cannot add'} more of the items into the cart`)
                  } else {
                      addItemToCart();
                  }
                } else {
                  addItemToCart();
                }
            }).catch(err => {
                this.showWarning(err)
            }).finally(() => {
                $target.removeClass('is-loading');
            })
        },

        checkSufficientStock: function(productForm) {
            const maxValidQuantity = productForm.find('[data-inventory-quantity]').data('inventory-quantity')
            const inputQuantity = parseInt(productForm.find('[data-inventory-quantity]').val())
            return maxValidQuantity >= inputQuantity
        }, 

        updateContentQuickshopOption3: function(handle){
            var quickShopPopup = $('#scoder-quickshop-popup-option-3'),
                quickShopPopupContent = quickShopPopup.find('.scoder-popup-content');

            $.ajax({
                type: 'get',
                url: window.routes.root + '/products/' + handle + '?view=ajax_quick_shop',
                beforeSend: function () {
                    $('[data-quick-view-popup] .scoder-popup-content').empty()
                },
                success: function (data) {
                    quickShopPopupContent.html(data);       
                },
                error: function (xhr, text) {
                    // alert($.parseJSON(xhr.responseText).description);
                    scoder.showWarning($.parseJSON(xhr.responseText).description);
                },
                complete: function () {
                    var $scope = quickShopPopup.find('.quickshop');
                    
                    scoder.productImageGallery($scope);
                    setTimeout(() => {
                        $body.addClass('quickshop-popup-show');
                    }, 150)
                }
            });
        },

        appendProductQuickShopOption2: function(product) {
            //  Append Product Popup Quick Shop 2 Show Mobile
            if (window.innerWidth <= 767) {
                var quickshopMobilePopup = $doc.find('#scoder-card-mobile-popup');
                var quickshopForm = product.clone();
                quickshopMobilePopup.find('.scoder-popup-content').empty();
                quickshopForm.find('.card-product__group').remove();
                quickshopMobilePopup.find('.scoder-popup-content').append(quickshopForm);

                var form = quickshopMobilePopup.find('[data-quickshop] form').eq('0');
                var mobilePopupId = form.attr('id') + 'mobile';
                form.attr('id', mobilePopupId);
                var optionInputs = form.find('.single-option');
                var optionLabels = form.find('.single-label');

                optionInputs.each((index, optionInput) => {
                    $(optionInput).attr('id', $(optionInput).attr('id') + '-mobile');
                })
                
                optionLabels.each((index, optionLabel) => {
                    $(optionLabel).attr('for', $(optionLabel).attr('for') + '-mobile');
                })

                quickshopMobilePopup.addClass('show');

                $doc.on('click', (e) => {
                    var $target = $(e.target)
                    if ($target.hasClass('background-overlay')) {
                        quickshopMobilePopup.removeClass('show');
                        $body.removeClass('quick_shop_popup_mobile');
                        product.removeClass('quickshop-popup-show');
                    }
                })
            } 
        },

        isRunningInIframe: function() {
            try {
                return window.self !== window.top;
            } catch (e) {
                return true;
            }
        },

        redirectTo: function(url){
            if (scoder.isRunningInIframe() && !window.iframeSdk) {
                window.top.location = url;
            } else {
                window.location = url;
            }
        },

        initQuickCart: function() {
            if(window.quick_cart.show){
                if(window.quick_cart.type == 'popup'){
                } else {
                    scoder.initSidebarCart();
                }
            }

            scoder.initEventQuickCart();
        },

        initEventQuickCart: function(){
            scoder.removeItemQuickCart();
            scoder.updateQuantityItemQuickCart();
            scoder.editQuickCart();
        },

        productCollectionCartSlider: function(){
            var productCart = $('[data-product-collection-cart]');

            productCart.each((index, element) => {
                var self = $(element),
                    productGrid = self.find('.products-carousel'),
                    itemDots = productGrid.data('item-dots'),
                    itemArrows = productGrid.data('item-arrows');

                if(productGrid.length > 0){
                    if(!productGrid.hasClass('slick-initialized')){
                        productGrid.slick({
                            mobileFirst: true,
                            adaptiveHeight: false,
                            infinite: false,
                            vertical: false,
                            slidesToShow: 1,
                            slidesToScroll: 1,
                            dots: true,
                            arrows: false,
                            nextArrow: window.arrows.icon_next,
                            prevArrow: window.arrows.icon_prev,
                            rtl: window.rtl_slick,
                            responsive: [
                            {
                                breakpoint: 1025,
                                settings: {
                                    dots: itemDots,
                                    arrows: itemArrows
                                }
                            }]
                        });
                    }
                }
            });
        },

        initSidebarCart: function() {
            var cartIcon = $('[data-cart-sidebar]');
            Shopify.getCart((cart) => {
                scoder.updateSidebarCart(cart);
            });
            if ($body.hasClass('template-cart')) {
                cartIcon.on('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    $('html, body').animate({
                        scrollTop: 0
                    }, 700);
                });
            } else {
                cartIcon.on('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    
                    $body.addClass('cart-sidebar-show');
                });
            }

            $doc.on('click', '[data-close-cart-sidebar]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                if ($body.hasClass('cart-sidebar-show')) {
                    $body.removeClass('cart-sidebar-show');
                }
            });

            $body.on('click', '.background-overlay', (event) => {
                if ($body.hasClass('cart-sidebar-show') && !$body.hasClass('edit-cart-show') && !$body.hasClass('term-condition-show') && !$body.hasClass('has-warning')) {
                    if (($(event.target).closest('#scoder-cart-sidebar').length === 0) && 
                        ($(event.target).closest('[data-cart-sidebar]').length === 0) && 
                        ($(event.target).closest('[data-edit-cart-popup]').length === 0) && 
                        ($(event.target).closest('[data-warning-popup]').length === 0) && 
                        ($(event.target).closest('[data-term-condition-popup]').length === 0)){
                        $body.removeClass('cart-sidebar-show');
                    }
                }
            })
        },

        updateSidebarCart: function(cart) {
            if(!$.isEmptyObject(cart)){
                const $cartDropdown = $('#scoder-cart-sidebar .scoder-sidebar-wrapper .previewCart-wrapper');
                const $cartLoading = '<div class="loading-overlay loading-overlay--custom">\
                        <div class="loading-overlay__spinner">\
                            <svg aria-hidden="true" focusable="false" role="presentation" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">\
                                <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>\
                            </svg>\
                        </div>\
                    </div>';
                const loadingClass = 'is-loading';

                $cartDropdown
                    .addClass(loadingClass)
                    .prepend($cartLoading);

                $.ajax({
                    type: 'GET',
                    url: window.routes.root + '/cart?view=ajax_side_cart',
                    cache: false,
                    success: function (data) {
                        var response = $(data);

                        $cartDropdown
                            .removeClass(loadingClass)
                            .html(response);

                        scoder.dispatchChangeForShippingMessage();
                    },
                    error: function (xhr, text) {
                        scoder.showWarning($.parseJSON(xhr.responseText).description);
                    },
                    complete: function () {
                        $body.find('[data-cart-count]').text(cart.item_count);
                        scoder.productCollectionCartSlider();
                        scoder.updateGiftWrapper();
                        if (scoder.checkNeedToConvertCurrency()) {
                          Currency.convertAll(window.shop_currency, $('#currencies .active').attr('data-currency'), 'span.money', 'money_format');
                        };
                        document.dispatchEvent(new CustomEvent('cart-update', { detail: cart }));
                    }
                });
            }
        },

        dispatchChangeForShippingMessage: function() {
            document.querySelectorAll('[data-free-shipping-wrapper]').forEach(freeShippingWrapper => {
                const changeEvent = new Event('change', { bubbles: true })
                freeShippingWrapper.dispatchEvent(changeEvent);
            })
        },

        updateGiftWrapper: function() {
            let debounce 
            $('#gift-wrapping').off('click').on('click', (event) => {
                event.stopPropagation()
                event.preventDefault()
                clearTimeout(debounce)
                debounce = setTimeout(() => {
                    const variantId = event.target.dataset.giftId;
                    Shopify.addItem(variantId, 1, () => {
                        Shopify.getCart((cart) => {
                            scoder.updateSidebarCart(cart);
                        });
                    }); 
                }, 250)
            });

            $('#cart-gift-wrapp').off('click').on('click', (event) => {
                event.stopPropagation()
                event.preventDefault()

                var $target = $(event.currentTarget),
                    text = $target.attr('data-adding-text');
                $target.text(text);

                clearTimeout(debounce)
                debounce = setTimeout(() => {
                    const variantId = event.target.dataset.giftId;
                    Shopify.addItem(variantId, 1, () => {
                        Shopify.getCart((cart) => {
                            scoder.updateCart(cart)
                        });
                    }); 
                }, 250)
            });
        },

        removeItemQuickCart: function () {
            $doc.on('click', '[data-cart-remove]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                var $target = $(event.currentTarget),
                productId = $target.attr('data-cart-remove-id'),
                text = $('#cart-gift-wrapp').attr('data-add-text'),
                productLine = $target.data('line');
            
            //     console.log('----DEBUG REMOVE CART ITEM----');
            //     console.log('Evento:', event);
            //     console.log('Target elemento:', $target);
            //     console.log('Product ID:', productId);
            //     console.log('Text:', text);
            //     console.log('Product Line:', productLine);
            //     console.log('Target attributes:', {
            //         'data-cart-remove-id': $target.attr('data-cart-remove-id'),
            //         'data-line': $target.data('line'),
            //         'element': $target.get(0)
            // });

                $('#cart-gift-wrapp').text(text);

                Shopify.removeItem(productLine, (cart) => {
                    if($body.hasClass('template-cart')){
                        scoder.updateCart(cart);
                    } else if($body.hasClass('cart-modal-show')){
                        // scoder.updateDropdownCart(cart);
                    } else if($body.hasClass('cart-sidebar-show')) {
                        scoder.updateSidebarCart(cart);
                    }
                });
            });
        },

        updateCart: function(cart){
            if(!$.isEmptyObject(cart)){
                const $sectionId = $('#main-cart-items').data('id');
                const $cart = $('[data-cart]')
                const $cartContent = $cart.find('[data-cart-content]');
                const $cartTotals = $cart.find('[data-cart-total]');
                const $cartLoading = '<div class="loading-overlay loading-overlay--custom">\
                        <div class="loading-overlay__spinner">\
                            <svg aria-hidden="true" focusable="false" role="presentation" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">\
                                <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>\
                            </svg>\
                        </div>\
                    </div>';
                const loadingClass = 'is-loading';

                $cart
                    .addClass(loadingClass)
                    .prepend($cartLoading);

                $.ajax({
                    type: 'GET',
                    url: `/cart?section_id=${$sectionId}`,
                    cache: false,
                    success: function (data) {
                        var jsPreventedData = data.replaceAll('cart-coupon-discount', 'div');
                        var response = $(jsPreventedData);

                        $cart.removeClass(loadingClass);
                        $cart.find('.loading-overlay').remove();

                        if(cart.item_count > 0){
                            var contentCart =  response.find('[data-cart-content] .cart').html(),
                                subTotal = response.find('[data-cart-total] .cart-total-subtotal').html(),
                                grandTotal = response.find('[data-cart-total] .cart-total-grandtotal').html(),
                                savings = response.find('[data-cart-total] .cart-total-savings').html();

                            $cartContent.find('.cart').html(contentCart);
                            $cartTotals.find('.cart-total-subtotal').html(subTotal);
                            $cartTotals.find('.cart-total-grandtotal').html(grandTotal);
                            $cartTotals.find('.cart-total-savings').html(savings);

                            if(response.find('.scoderCalculatorShipping').length > 0){
                                var calculatorShipping = response.find('.scoderCalculatorShipping');

                                $cart.find('.scoderCalculatorShipping').replaceWith(calculatorShipping);
                            }
                        } else {
                            var contentCart =  response.find('#main-cart-items').html(),
                                headerCart =  response.find('.page-header').html();

                            $('#main-cart-items').html(contentCart);
                            $('.page-header').html(headerCart);
                        }
                    },
                    error: function (xhr, text) {
                        scoder.showWarning($.parseJSON(xhr.responseText).description);
                    },
                    complete: function () {
                        $body.find('[data-cart-count]').text(cart.item_count);
                        scoder.dispatchChangeForShippingMessage();
                        if (scoder.checkNeedToConvertCurrency()) {
                            Currency.convertAll(window.shop_currency, $('#currencies .active').attr('data-currency'), 'span.money', 'money_format');
                        }
                        if ($body.hasClass('template-cart')) {
                            const giftWrapping = document.getElementById('cart-gift-wrapp')
                            const isChecked = giftWrapping?.dataset.isChecked
                            const variantId = giftWrapping?.dataset.giftId
                            if (isChecked === 'true') {
                                $('#gift-cards').hide()
                                const giftCardRemoveButton = document.querySelector(`[data-cart-remove-id="${variantId}"]`)
                                const giftCardQuantityInput = document.querySelector(`[data-cart-quantity-id="${variantId}"]`)

                                giftCardRemoveButton?.addEventListener('click', () => {
                                    giftWrapping.dataset.isChecked = 'false'
                                })

                                giftCardQuantityInput?.addEventListener('change', (e) => {
                                    const value = Number(e.target.value)
                                    if (value  <= 0) {
                                        giftWrapping.dataset.isChecked = 'false'
                                    }
                                })
                            } else {
                                $('#gift-cards').show()
                            }
                        }
                        
                        document.dispatchEvent(new CustomEvent('cart-update', { detail: cart }));
                    }
                });
            }
        },

        // Funcion para actualizar el carrito popup
        updateQuantityItemQuickCart: function(){
            $doc.on('change', '[data-cart-quantity]', (event) => {
                console.log('updateQuantityItemQuickCart');

                event.preventDefault();
                event.stopPropagation();

                var $target = $(event.currentTarget),
                    productId = $target.attr('data-cart-quantity-id'),
                    productLine = $target.data('line'),
                    quantity = parseInt($target.val()),
                    stock = parseInt($target.data('inventory-quantity'));
                let enoughInStock = true;

               
                if (stock < quantity && stock > 0) {
                  var arrayInVarName = `cart_selling_array_${event.currentTarget.closest('cart-update-quantity').dataset.product}`,
                    itemInArray = window[arrayInVarName],
                    itemStatus = itemInArray[event.currentTarget.closest('cart-update-quantity').dataset.variant];
                  if(itemStatus == 'deny') {
                    quantity = stock;
                    enoughInStock = false;
                  }
                }


                Shopify.changeItemCustomCarrito(productLine, quantity, (cart) => {
                    if($body.hasClass('template-cart')){
                        scoder.updateCart(cart);
                        console.log("template-cart");
                    } else if($body.hasClass('cart-modal-show')){
                        console.log("cart-modal-show");
                        scoder.updateSidebarCart(cart);
                    } else if($body.hasClass('cart-sidebar-show')) {
                        console.log("cart-sidebar-show");
                        scoder.updateSidebarCart(cart);
                    }
                    if (!enoughInStock) scoder.showWarning(`${ window.cartStrings.addProductOutQuantity.replace('[maxQuantity]', quantity) }`)
                });
            });
        },

        editQuickCart: function() {
            $doc.on('click', '[data-open-edit-cart]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                var $target = $(event.currentTarget),
                    url = $target.data('edit-cart-url'),
                    itemId = $target.data('edit-cart-id'),
                    itemLine = $target.data('line'),
                    quantity = $target.data('edit-cart-quantity'),
                    option = $target.parents('.previewCartItem').find('previewCartItem-variant').text();

                const modal = $('[data-edit-cart-popup]'),
                    modalContent = modal.find('.scoder-popup-content');

                $.ajax({
                    type: 'get',
                    url: url,
                    cache: false,
                    dataType: 'html',
                    success: function(data) {
                        modalContent.html(data);
                        modalContent
                            .find('[data-template-cart-edit]')
                            .attr({
                                'data-cart-update-id': itemId,
                                'data-line': itemLine
                            });

                        var productItem = modalContent.find('.product-edit-item');
                        productItem.find('input[name="quantity"]').val(quantity);
                    },
                    error: function(xhr, text) {
                        scoder.showWarning($.parseJSON(xhr.responseText).description);
                    },
                    complete: function () {
                        $body.addClass('edit-cart-show');

                        if (scoder.checkNeedToConvertCurrency()) {
                            Currency.convertAll(window.shop_currency, $('#currencies .active').attr('data-currency'), 'span.money', 'money_format');
                        };

                    }
                });
            });

            $doc.on('click', '[data-close-edit-cart]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                $body.removeClass('edit-cart-show');
            });

            $doc.on('click', (event) => {
                if ($body.hasClass('edit-cart-show')) {
                    if (($(event.target).closest('[data-edit-cart-popup]').length === 0) && ($(event.target).closest('[data-open-edit-cart]').length === 0)){
                        $body.removeClass('edit-cart-show');
                    }
                }
            });

            scoder.addMoreItemEditCart();
            scoder.addAllItemCartEdit();
        },

        addMoreItemEditCart: function(){
            $doc.on('click', '[data-edit-cart-add-more]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                var itemWrapper = $('[data-template-cart-edit]'),
                    currentItem = $(event.target).parents('.product-edit-item'),
                    count = parseInt(itemWrapper.attr('data-count')),
                    cloneProduct = currentItem.clone().removeClass('product-edit-itemFirst');
                    cloneProductId = cloneProduct.attr('id') + count;

                cloneProduct.attr('id', cloneProductId);

                scoder.updateClonedProductAttributes(cloneProduct, count);

                cloneProduct.insertAfter(currentItem);

                count = count + 1;
                itemWrapper.attr('data-count', count);
            });

            $doc.on('click', '[data-edit-cart-remove]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                var currentItem = $(event.target).parents('.product-edit-item');

                currentItem.remove();
            });
        },

        updateClonedProductAttributes: function(product, count){
            var form = $('.shopify-product-form', product),
                formId = form.attr('id'),
                newFormId = formId + count;

            form.attr('id', newFormId);

            $('.product-form__radio', product).each((index, element) => {
                var formInput = $(element),
                    formLabel = formInput.next(),
                    id = formLabel.attr('for'),
                    newId = id + count,
                    formInputName = formInput.attr('name');

                formLabel.attr('for', newId);

                formInput.attr({
                    id: newId,
                    name: formInputName + count
                });
            });
        },

        addAllItemCartEdit: function() {
            $doc.on('click', '#add-all-to-cart', (event) => {
                event.preventDefault();
                event.stopPropagation();

                var $target = $(event.currentTarget),
                    cartEdit = $('[data-template-cart-edit]'),
                    product = cartEdit.find('.product-edit-item.isChecked'),
                    productId = cartEdit.attr('data-cart-update-id');
                    productLine = cartEdit.data('line');

                if(product.length > 0){
                    $target.addClass('is-loading');

                    Shopify.removeItem(productLine, (cart) => {
                        if(!$.isEmptyObject(cart)) {
                            var productHandleQueue = [];

                            var ajax_caller = function(data) {
                                return $.ajax(data);
                            }

                            product.each((index, element) => {
                                var item = $(element),
                                    variantId = item.find('input[name="id"]').val(),
                                    qty = parseInt(item.find('input[name="quantity"]').val());

                                productHandleQueue.push(ajax_caller({
                                    type: 'post',
                                    url: window.routes.root + '/cart/add.js',
                                    data: 'quantity=' + qty + '&id=' + variantId,
                                    dataType: 'json',
                                    async: false
                                }));
                            });

                            if(productHandleQueue.length > 0) {
                                $.when.apply($, productHandleQueue).done((event) => {
                                    setTimeout(function(){ 
                                        $target.removeClass('is-loading');
                                    }, 1000);

                                    Shopify.getCart((cart) => {
                                        $body.removeClass('edit-cart-show');

                                        if($body.hasClass('template-cart')){
                                            scoder.updateCart(cart);
                                        } else if($body.hasClass('cart-modal-show')){
                                            // scoder.updateDropdownCart(cart);
                                        } else if($body.hasClass('cart-sidebar-show')) {
                                            scoder.updateSidebarCart(cart);
                                        }
                                    });
                                });
                            }
                        }
                    });
                } else {
                    alert(window.variantStrings.addToCart_message);
                }
            });
        },

        initNotifyInStock: function() {
            $doc.on('click', '[data-open-notify-popup]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                var $target = $(event.currentTarget);

                scoder.notifyInStockPopup($target);
            });

            $doc.on('click', '[data-close-notify-popup]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                $body.removeClass('notify-me-show');
                setTimeout(() => {
                    $('.scoder-notify-popup .form-field').removeClass('hidden')
                    $('.scoder-notify-popup .form-message').addClass('hidden')
                }, 700)
            });

            $doc.on('click', (event) => {
                if($body.hasClass('notify-me-show')){
                    if (($(event.target).closest('[data-open-notify-popup]').length === 0) && ($(event.target).closest('[data-notify-popup]').length === 0)){
                        $body.removeClass('notify-me-show');
                        setTimeout(() => {
                            $('.scoder-notify-popup .form-field').removeClass('hidden')
                            $('.scoder-notify-popup .form-message').addClass('hidden')
                        }, 700)
                    }
                }
            });
        },

        notifyInStockPopup: function($target){
            var variant,
                product = $target.parents('.product-item'),
                title = product.find('.card-title').data('product-title'),
                link = product.find('.card-title').data('product-url'),
                popup = $('[data-notify-popup]');

            if($target.hasClass('is-notify-me')){
                variant = product.find('.card-swatch .swatch-label.is-active').attr('title');
            } else {
                variant = $target.data('variant-id');
            }

            popup.find('[name="scoder-notify-product-title"]').val($.trim(title));
            popup.find('[name="scoder-notify-product-link"]').val(link);

            if(variant){
                popup.find('[name="scoder-notify-product-variant"]').val(variant);
            }
            $body.addClass('notify-me-show');
        },

        notifyInStockAction: function($target){
            var proceed = true,
                $notify = $target.parents('.scoder-notifyMe'),
                $notifyForm = $notify.find('.notifyMe-form'),
                $notifyText = $notify.find('.notifyMe-text'),
                notifyMail = $notify.find('input[name="email"]').val(),
                email_reg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
                message;

            if (!email_reg.test(notifyMail) || (!notifyMail)){
                $notify
                    .find('.form-field')
                    .removeClass('form-field--success')
                    .addClass('form-field--error');

                proceed = false;
                message = '<div class="alertBox alertBox--error"><p class="alertBox-message">'+ window.notify_me.error +'</p></div>';

                $notifyText.html(message).show();
            } else {
                $notify
                    .find('.form-field')
                    .removeClass('form-field--error')
                    .addClass('form-field--success');

                $notifyText.html('').hide();
            }

            if (proceed) {
                var notifySite = $notify.find('[name="scoder-notify-product-site"]').val(),
                    notifySiteUrl = $notify.find('[name="scoder-notify-product-site-url"]').val(),
                    notifyToMail = window.notify_me.mail,
                    notifySubjectMail = window.notify_me.subject,
                    notifyLabelMail = window.notify_me.label,
                    productName = $notify.find('[name="scoder-notify-product-title"]').val(),
                    productUrl = $notify.find('[name="scoder-notify-product-link"]').val(),
                    productVariant = $notify.find('[name="scoder-notify-product-variant"]').val();

                var content = '<div style="margin:30px auto;width:650px;border:10px solid #f7f7f7"><div style="border:1px solid #dedede">\
                        <h2 style="margin: 0; padding:20px 20px 20px;background:#f7f7f7;color:#555;font-size:2em;text-align:center;">'+ notifySubjectMail +'</h2>';

                content += '<table style="margin:0px 0 0;padding:30px 30px 30px;line-height:1.7em">\
                          <tr><td style="padding: 5px 25px 5px 0;"><strong>Product Name: </strong> ' + productName + '</td></tr>\
                          <tr><td style="padding: 5px 25px 5px 0;"><strong>Product URL: </strong> ' + productUrl + '</td></tr>\
                          <tr><td style="padding: 5px 25px 5px 0;"><strong>Email Request: </strong> ' + notifyMail + '</td></tr>\
                          '+ ((productVariant != '') ? '<tr><td style="padding: 5px 25px 5px 0;"><strong>Product Variant: </strong>' + productVariant + '</td></tr>' : '') +'\
                       </table>';

                content += '<a href="'+ notifySiteUrl +'" style="display:block;padding:30px 0;background:#484848;color:#fff;text-decoration:none;text-align:center;text-transform:uppercase">&nbsp;'+ notifySite +'&nbsp;</a>';
                content += '</div></div>';

                var notify_post_data = {
                    'api': 'i_send_mail',
                    'subject': notifySubjectMail,
                    'email': notifyToMail,
                    'from_name': notifyLabelMail,
                    'email_from': notifyMail,
                    'message': content
                };

                $.post('https://themevale.net/tools/sendmail/quotecart/sendmail.php', notify_post_data, (response) => {
                    if (response.type == 'error') {
                       message = '<div class="alertBox alertBox--error"><p class="alertBox-message">'+ response.text +'</p></div>';
                    } else {
                       message = '<div class="alertBox alertBox--success"><p class="alertBox-message">'+ window.notify_me.success +'</p></div>';
                       scoder.resetForm($notifyForm);
                    }

                    $notifyText.html(message).show();
                }, 'json');
            }
        },

        resetForm: function(form){
            $('.form-field', form).removeClass('form-field--success form-field--error');
            $('input[type=email], input[type=text], textarea', form).val('');
        },

        initCompareProduct: function() {
            var $compareLink = $('a[data-compare-link]');

            if(window.compare.show){
                scoder.setLocalStorageProductForCompare($compareLink);
                scoder.setAddorRemoveProductForCompare($compareLink);
                scoder.setProductForCompare();

                $doc.on('click', '[data-close-compare-product-popup]', (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    $body.removeClass('compare-product-show');
                });

                $doc.on('click', (event) => {
                    if($body.hasClass('compare-product-show')){
                        if (($(event.target).closest('[data-compare-link]').length === 0) && ($(event.target).closest('[data-compare-product-popup]').length === 0)){
                            $body.removeClass('compare-product-show');
                        }
                    }
                });
            }
        },

        setLocalStorageProductForCompare: function($link) {
            var count = JSON.parse(localStorage.getItem('compareItem')),
                items = $('[data-product-compare-handle]');

            if(count !== null){ 
                if(items.length > 0) {
                    items.each((index, element) => {
                        var item = $(element),
                            handle = item.data('product-compare-handle');

                        if(count.indexOf(handle) >= 0) {
                            item.find('.compare-icon').addClass('is-checked');
                            item.find('.text').text(window.compare.added);
                            item.find('input').prop('checked', true);
                        } else {
                            item.find('.compare-icon').removeClass('is-checked');
                            item.find('.text').text(window.compare.add);
                            item.find('input').prop('checked', false);
                        }
                    });

                    scoder.updateCounterCompare($link);
                }
            }
        },

        setAddorRemoveProductForCompare: function($link) {
            $doc.on('change', '[data-product-compare] input', (event) => {
                var $this = $(event.currentTarget),
                    item = $this.parents('.card-compare'),
                    handle = $this.val(),
                    count = JSON.parse(localStorage.getItem('compareItem'));

                count = scoder.uniqueArray(count);

                if(event.currentTarget.checked) {
                    item.find('.compare-icon').addClass('is-checked');
                    item.find('.text').text(window.compare.added);
                    item.find('input').prop('checked', true);
                    scoder.incrementCounterCompare(count, handle, $link);
                } else {
                    item.find('.compare-icon').removeClass('is-checked');
                    item.find('.text').text(window.compare.add);
                    item.find('input').prop('checked', false);
                    scoder.decrementCounterCompare(count, handle, $link);
                }
            });
        },

        setProductForCompare: function() {
            $doc.on('click', '[data-compare-link]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                var count = JSON.parse(localStorage.getItem('compareItem'));

                if (count.length <= 1) {
                    alert(window.compare.message);

                    return false;
                } else {
                    scoder.updateContentCompareProduct(count);
                }
            });

            $doc.on('click', '[data-compare-remove]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                var id = $(event.currentTarget).data('compare-item'),
                    compareTable = $('[data-compare-product-popup] .compareTable'),
                    item = compareTable.find('.compareTable-row[data-product-compare-id="'+ id +'"]'),
                    handle = item.data('compare-product-handle');

                if(compareTable.find('tbody .compareTable-row').length == 1){
                    item.remove();
                    var count = JSON.parse(localStorage.getItem('compareItem')),
                        index = count.indexOf(handle),
                        $compareLink = $('a[data-compare-link]');

                    if (index > -1) {
                        count.splice(index, 1);
                        count = scoder.uniqueArray(count);
                        localStorage.setItem('compareItem', JSON.stringify(count));

                        scoder.setLocalStorageProductForCompare($compareLink);
                        scoder.updateCounterCompare($compareLink);
                    }

                    $body.removeClass('compare-product-show');
                } else {
                    item.remove();
                    
                    var count = JSON.parse(localStorage.getItem('compareItem')),
                        index = count.indexOf(handle),
                        $compareLink = $('a[data-compare-link]');

                    if (index > -1) {
                        count.splice(index, 1);
                        count = scoder.uniqueArray(count);
                        localStorage.setItem('compareItem', JSON.stringify(count));

                        scoder.setLocalStorageProductForCompare($compareLink);
                        scoder.updateCounterCompare($compareLink);
                    }
                }
            });
        },

        updateCounterCompare: function($link) {
            var count = JSON.parse(localStorage.getItem('compareItem'));

            if (count.length > 1) {
                $link.parent().addClass('is-show');
                $link.find('span.countPill').html(count.length);
            } else {
                $link.parent().removeClass('is-show');
            }
        },

        uniqueArray: function(list) {
            var result = [];

            $.each(list, function(index, element) {
                if ($.inArray(element, result) == -1) {
                    result.push(element);
                }
            });

            return result;
        },

        incrementCounterCompare: function(count, item, $link){
            const index = count.indexOf(item);

            count.push(item);
            count = scoder.uniqueArray(count);

            localStorage.setItem('compareItem', JSON.stringify(count));

            scoder.updateCounterCompare($link);
        },

        decrementCounterCompare: function(count, item, $link){
            const index = count.indexOf(item);

            if (index > -1) {
                count.splice(index, 1);
                count = scoder.uniqueArray(count);
                localStorage.setItem('compareItem', JSON.stringify(count));

                scoder.updateCounterCompare($link);
            }
        },

        updateContentCompareProduct: function(list){
            var popup = $('[data-compare-product-popup]'),
                compareTable = popup.find('.compareTable');

            compareTable.find('tbody').empty();

            $.ajax({
                type: 'get',
                url: window.routes.root + '/collections/all',
                cache: false,
                data: {
                    view: 'ajax_product_card_compare',
                    constraint: `limit=${list.length}+sectionId=list-compare+list_handle=` + encodeURIComponent(list)
                },
                beforeSend: function () {},
                success: function (data) {
                    compareTable.find('tbody').append(data);
                },
                error: function (xhr, text) {
                    alert($.parseJSON(xhr.responseText).description);
                },
                complete: function () {
                    $body.addClass('compare-product-show');
                }
            });
        },

        initProductView: function($scope){
            scoder.productImageGallery($scope);
            scoder.productLastSoldOut($scope);
            scoder.productCustomerViewing($scope);
            scoder.productCountdown($scope);
            scoder.productSizeChart($scope);
            scoder.productCustomCursor($scope);
            scoder.productVideoGallery($scope);
            scoder.initVariantImageGroup($scope, window.variant_image_group);
        },

        initQuickView: function(){
            let checkLoadQV = true;

            $doc.on('click', '[data-open-quick-view-popup]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                if (checkLoadQV) {
                    checkLoadQV = false;
                    const $quickView = document.querySelector('.scoder-quick-view-popup');
                    const urlStyleProduct = $quickView.dataset.urlStyleProduct;
                    const urlStyleQV = $quickView.dataset.urlStyleQuickView;
                    const urlVariantsQV = $quickView.dataset.urlVariantsQuickView;
                    const urlSortable = 'https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js';

                    if (!document.body.matches('.qs3-loaded')) scoder.buildStyleSheet(urlStyleProduct, $quickView);
                    scoder.buildStyleSheet(urlStyleQV, $quickView);
                    scoder.buildScript(urlVariantsQV);
                    document.body.classList.add('qv-loaded');
                    if (!document.body.matches('.sortable-loader')) {
                        document.body.classList.add('sortable-loader');
                        scoder.buildScript(urlSortable);
                    }
                }

                var handle = $(event.currentTarget).data('product-handle');

                scoder.updateContentQuickView(handle);
            });

            $doc.on('click', '[data-close-quick-view-popup]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                $body.removeClass('quick-view-show');
            });
            
            $('.background-overlay').off('click.closeQuickView').on('click.closeQuickView', e => {
                if ($body.hasClass('quick-view-show') &&
                       !$body.hasClass('cart-sidebar-show') && 
                       !$body.hasClass('ask-an-expert-show') && 
                       !$body.hasClass('size-chart-show') && 
                       !$body.hasClass('compare-color-show') && 
                       !$body.hasClass('term-condition-show')
                   ) {
                    $body.removeClass('quick-view-show');
                }
            });
        },

        updateContentQuickView: function(handle){
            var popup = $('[data-quick-view-popup]'),
                popupContent = popup.find('.scoder-popup-content');
                // console.log('Handle:', handle);
                // console.log('URL completa:', window.routes.root + '/products/' + handle + '?view=ajax_quick_view');
            
            $.ajax({
                type: 'get',
                url: window.routes.root + '/products/' + handle + '?view=ajax_quick_view',
                beforeSend: function () {
                    // console.log('Iniciando petición...');
                    popupContent.empty();
                    $('#scoder-quickshop-popup-option-3').find('.scoder-popup-content').empty()
                },
                success: function (data) {
                    //  console.log('Respuesta exitosa:', data); // Ver respuesta HTML
                    // console.log('URL final:', this.url); // Ver URL final
                    popupContent.html(data);
                },
                error: function (xhr, text) {
                    alert($.parseJSON(xhr.responseText).description);
                },
                complete: function () {
                    var $scope = popup.find('.quickView');
                    const items = $('.scoder-popup-content .scoder-compare-color-popup li.item'),
                        tableList = $('.scoder-popup-content .scoder-compare-color-popup #comparesortList'),
                        compareColorPopup = $('.scoder-popup-content .scoder-compare-color-popup'),
                        sizeChartPopup = $('.scoder-popup-content .scoder-size-chart-popup');
                    
                    scoder.productImageGallery($scope);
                    scoder.productLastSoldOut($scope);
                    scoder.productCustomerViewing($scope);
                    scoder.productCountdown($scope);
                    scoder.productSizeChart($scope);
                    scoder.setProductForWishlist(handle);
                    scoder.initVariantImageGroup($scope, window.variant_image_group_quick_view);

                    $body.addClass('quick-view-show');

                    if (window.Shopify && Shopify.PaymentButton) {
                        Shopify.PaymentButton.init();
                    }

                    tableList.attr('id', 'quickViewSortTableList');

                    items.each((index, element) => {
                        const itemInput = $(element).find('.swatch-compare-color-option'),
                            itemLabel = $(element).find('.swatch-compare-color-label'),
                            itemId = itemInput.attr('id');

                        itemInput
                            .attr('id', `quickView-${itemId}`)
                            .attr('name', `quickView-${itemId}`);
                        itemLabel.attr('for', `quickView-${itemId}`);
                    });

                    compareColorPopup.attr('id', 'quickView-scoder-compare-color-popup');
                    sizeChartPopup.attr('id', 'quickView-scoder-size-chart-popup');

                    if ($('.scoder-productView .addthis_inline_share_toolbox').length) {
                        var html = $('.scoder-productView .addthis_inline_share_toolbox').html();

                        $('.scoder-popup-content .share-button__button').click(function(){
                            $('.scoder-popup-content .addthis_inline_share_toolbox').append(html);
                        });
                    }

                    const thisSortTable = document.getElementById('quickViewSortTableList');
                    const thisImageList = $('.scoder-popup-content .scoder-compareColors-image');

                    if (window.innerWidth >= 1025 && thisSortTable) {
                        new Sortable(thisSortTable, {
                            animation: 150
                        });
                    } else {
                        onRemoveHandlerQuickView();
                    }

                    function onRemoveHandlerQuickView(){
                        thisImageList.on('click', '.item', (event) => {
                            event.preventDefault();

                            var $target = event.currentTarget,
                                itemId = $target.classList[1].replace('item-', ''),
                                optionId = `swatch-compare-color-${itemId}`,
                                item = $(document.getElementById(optionId));

                            item.trigger('click');
                        });
                    }

                    if (window.review.show_quick_view && $('.shopify-product-reviews-badge').length > 0) {
                            //  return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();
                    }
                }
            });
        },
            initAskAnExpert: function () {
                $doc.on("click", "[data-open-ask-an-expert]", (event) => {
                  event.preventDefault();
                  event.stopPropagation();
          
                  var askAnExpert = $("[data-ask-an-expert-popup]"),
                    modalContent = askAnExpert.find(".scoder-popup-content"),
                    url;
          
                  if ($body.hasClass("template-product")) {
                    var handle = $(".productView").data("product-handle");
          
                    url =
                      window.routes.root +
                      "/products/" +
                      handle +
                      "?view=ajax_ask_an_expert";
                  } else if ($body.hasClass("quick-view-show")) {
                    var handle = $(".scoder-quickView").data("product-quickview-handle");
          
                    url =
                      window.routes.root +
                      "/products/" +
                      handle +
                      "?view=ajax_ask_an_expert";
                  } else {
                    url = window.routes.root + "/search?view=ajax_ask_an_expert";
                  }
          
                  $.ajax({
                    type: "get",
                    url: url,
                    beforeSend: function () {
                      modalContent.empty();
                    },
                    success: function (data) {
                      modalContent.html(data);
                    },
                    error: function (xhr, text) {
                      alert($.parseJSON(xhr.responseText).description);
                    },
                    complete: function () {
                      $body.addClass("ask-an-expert-show");
                    },
                  });
                });
          
                $doc.on("click", "[data-close-ask-an-expert]", (event) => {
                  event.preventDefault();
                  event.stopPropagation();
          
                  $body.removeClass("ask-an-expert-show");
                  if ($body.hasClass("recently-popup-mb-show")) {
                    $body.removeClass("recently-popup-mb-show");
                  }
                });
          
                $doc.on("click", (event) => {
                  if ($body.hasClass("ask-an-expert-show")) {
                    if (
                      $(event.target).closest("[data-open-ask-an-expert]").length === 0 &&
                      $(event.target).closest("#scoder-ask-an-expert-popup").length === 0
                    ) {
                      $body.removeClass("ask-an-expert-show");
                    }
                  }
                });
              },

            resetForm: function (form) {
              $(".form-field", form).removeClass(
                "form-field--success form-field--error"
              );
              $("input[type=email], input[type=text], textarea", form).val("");
            },
        
            formMessage: function () {
              const error = window.location.href.indexOf("form_type=contact") > -1;
        
              if (window.location.href.indexOf("contact_posted=true") > -1 || error) {
                const formMessage = $(
                  `[data-form-message="${$.cookie("contact_form")}"]`
                );
                let delay = 400;
        
                if ($body.hasClass("template-product")) delay = 1600;
        
                switch (formMessage.data("form-message")) {
                  case "ask":
                    setTimeout(() => {
                      $body.addClass("ask-an-expert-show");
                    }, delay);
                    this.changeStateforContactForm(formMessage, error);
                    $(".scoder-notify-popup .form-message").addClass("hidden");
                    break;
                  case "contact":
                    formMessage.removeClass("hidden");
                    this.changeStateforContactForm(formMessage, error);
                    $(".scoder-notify-popup .form-message").addClass("hidden");
                    break;
                  case "notifyMe":
                    $(".scoder-notify-popup .form-field").addClass("hidden");
                    setTimeout(() => {
                      $body.addClass("notify-me-show");
                    }, delay);
                    this.changeStateforContactForm(formMessage, error);
                    break;
                }
              }
        
              $(document).on("click", "[data-button-message]", (event) => {
                $.cookie("contact_form", $(event.target).data("button-message"), {
                  expires: 1,
                  path: "/",
                });
              });
            },

        productImageGallery: function($scope) {
            var sliderNav = $scope.find('.productView-nav'),
                sliderFor = $scope.find('.productView-for:not(".mobile")'),
                sliderForMobile = $scope.find('.productView-for.mobile');

            if(!sliderFor.hasClass('slick-initialized') && !sliderNav.hasClass('slick-initialized')) {
                const navArrowsDesk = sliderNav.data('arrows-desk'),
                    navArrowsMobi = sliderNav.data('arrows-mobi'),
                    navCounterMobi = sliderNav.data('counter-mobi'),
                    navMediaCount = sliderNav.data('media-count'),
                    thumbnailToShow = parseInt(sliderFor.data('max-thumbnail-to-show'));
                
                let checkNav, checkFor, navSlideCount;

                var appendTimeout;

                sliderNav.hasClass('productView-nav-gallery') ? navSlideCount = Math.round(navMediaCount / 2) : navSlideCount = navMediaCount;
                sliderNav.hasClass('productView-horizontal-tabs') && navMediaCount == 2 ? navSlideCount = 1 : navSlideCount = navMediaCount;
                const slickCounter = `<div class="slick-counter">
                    <span class="slick-counter--current">1</span>
                    <span aria-hidden="true">/</span>
                    <span class="slick-counter--total">`+navSlideCount+`</span>
                </div>`

                sliderNav.on('init', () => {
                    if (window.innerWidth < 768 && navCounterMobi) {
                        if(variant_image_group == 'false'){
                            clearTimeout(appendTimeout);
                            appendTimeout = setTimeout(() => {
                                sliderNav.append(slickCounter);
                            }, 1000)
    
                            sliderNav.on('reInit afterChange', function (event, slick, currentSlide, nextSlide) {
                                var i = (currentSlide ? currentSlide : 0) + 1;
                                sliderNav.find('.slick-counter--current').text(i);
                            });
                        }
                    }
                });

                sliderNav.on('reInit', () => {
                    clearTimeout(appendTimeout);
                    appendTimeout = setTimeout(() => {
                        sliderNav.append(slickCounter);
                    }, 1000)
                });

                if (sliderNav.closest('.productView').is('.layout-4')) {
                    checkFor = false;
                }
                else {
                    checkFor = sliderFor;
                }

                if(sliderNav.hasClass('productView-nav-gallery')) {
                    var sliderNav2 = $scope.find('.productView-nav.productView-nav-gallery'),
                        length = sliderNav2.data('media-count'),
                        show = 2,
                        rows = 2;

                    if (length == 1) {
                      show = 1;
                      rows = 1;
                    }
                    if (length == 2) {
                      show = 2;
                      rows = 1;
                    }  

                    sliderNav2.slick({
                        dots: true,
                        rows: rows,
                        arrows: navArrowsDesk,
                        infinite: true,
                        slidesPerRow: 1,
                        slidesToShow: show,
                        focusOnSelect: false,
                        asNavFor: checkFor,
                        nextArrow: window.arrows.icon_next,
                        prevArrow: window.arrows.icon_prev,
                        rtl: window.rtl_slick,
                        responsive: [
                            {
                                breakpoint: 767,
                                settings: {
                                    arrows: navArrowsMobi
                                }
                            }
                        ]
                    });
                } else if(sliderNav.hasClass('productView-horizontal-tabs')) {
                    var sliderNav2 = $scope.find('.productView-nav.productView-horizontal-tabs'),
                        show = 2,
                        rows = 1;

                    sliderNav2.slick({
                        dots: true,
                        rows: rows,
                        arrows: navArrowsDesk,
                        infinite: true,
                        slidesPerRow: 1,
                        slidesToShow: show,
                        focusOnSelect: false,
                        asNavFor: checkFor,
                        nextArrow: window.arrows.icon_next,
                        prevArrow: window.arrows.icon_prev,
                        rtl: window.rtl_slick,
                        responsive: [
                            {
                                breakpoint: 767,
                                settings: {
                                    arrows: navArrowsMobi
                                }
                            }
                        ]
                    });
                } else {
                    if (!sliderNav.is('.style-2, .style-3') || window.innerWidth < 768) {
                        sliderNav.slick({
                            fade: true,
                            dots: false,
                            arrows: navArrowsDesk,
                            infinite: true,
                            slidesToShow: 1,
                            slidesToScroll: 1,
                            asNavFor: checkFor,
                            nextArrow: window.arrows.icon_next,
                            prevArrow: window.arrows.icon_prev,
                            rtl: window.rtl_slick,
                            responsive: [
                                {
                                    breakpoint: 768,
                                    settings: {
                                        arrows: navArrowsMobi
                                    }
                                }
                            ]
                        }); 
                        checkNav = sliderNav;
                    }
                    else {
                        checkNav = false;
                    }
                }

                if($scope.hasClass('layout-1') || $scope.hasClass('layout-2')){
                    sliderFor.on('init',(event, slick) => {
                        sliderFor.find('.animated-loading').removeClass('animated-loading');
                    });

                    sliderFor.slick({
                        slidesToShow: thumbnailToShow,
                        slidesToScroll: 1,
                        asNavFor: checkNav,
                        arrows: true,
                        dots: false,
                        draggable: false,
                        adaptiveHeight: false,
                        focusOnSelect: true,
                        vertical: true,
                        verticalSwiping: true,
                        infinite: true,
                        nextArrow: window.arrows.icon_next,
                        prevArrow: window.arrows.icon_prev,
                        responsive: [
                            {
                                breakpoint: 1600,
                                settings: {
                                    slidesToShow: thumbnailToShow > 3 ? thumbnailToShow - 1 : thumbnailToShow,
                                    slidesToScroll: 1
                                }
                            },
                            {
                                breakpoint: 1280,
                                settings: {
                                    vertical: false,
                                    verticalSwiping: false,
                                    rtl: window.rtl_slick,
                                }
                            },
                            {
                                breakpoint: 767,
                                settings: {
                                    slidesToShow: 3,
                                    slidesToScroll: 1,
                                    vertical: false,
                                    verticalSwiping: false,
                                    rtl: window.rtl_slick,
                                }
                            }
                        ]
                    });
                } else if($scope.hasClass('layout-3')){
                    sliderFor.on('init',(event, slick) => {
                        sliderFor.find('.animated-loading').removeClass('animated-loading');
                    });

                    sliderFor.slick({
                        slidesToShow: thumbnailToShow,
                        slidesToScroll: 1,
                        asNavFor: checkNav,
                        arrows: true,
                        dots: false,
                        focusOnSelect: true,
                        infinite: true,
                        nextArrow: window.arrows.icon_next,
                        prevArrow: window.arrows.icon_prev,
                        rtl: window.rtl_slick,
                        responsive: [
                            {
                                breakpoint: 1600,
                                settings: {
                                    slidesToShow: thumbnailToShow > 3 ? thumbnailToShow - 1 : thumbnailToShow,
                                    slidesToScroll: 1
                                }
                            },
                            {
                                breakpoint: 767,
                                settings: {
                                    slidesToShow: 3,
                                    slidesToScroll: 1
                                }
                            }
                        ]
                    });
                }

                sliderForMobile.on('init',(event, slick) => {
                    sliderForMobile.find('.animated-loading').removeClass('animated-loading');
                });

                sliderForMobile.slick({
                    slidesToShow:  parseInt(sliderForMobile.data('max-thumbnail-to-show')),
                    slidesToScroll: 1,
                    asNavFor: checkNav,
                    arrows: true,
                    dots: false,
                    draggable: false,
                    adaptiveHeight: false,
                    focusOnSelect: true,
                    vertical: true,
                    verticalSwiping: true,
                    infinite: true,
                    nextArrow: window.arrows.icon_next,
                    prevArrow: window.arrows.icon_prev,
                    rtl: window.rtl_slick,
                    responsive: [
                        {
                            breakpoint: 1600,
                            settings: {
                                slidesToShow: thumbnailToShow > 3 ? thumbnailToShow - 1 : thumbnailToShow,
                                slidesToScroll: 1
                            }
                        },
                        {
                            breakpoint: 1280,
                            settings: {
                                vertical: false,
                                verticalSwiping: false
                            }
                        },
                        {
                            breakpoint: 767,
                            settings: {
                                slidesToShow: 2.2,
                                slidesToScroll: 1,
                                vertical: false,
                                verticalSwiping: false
                            }
                        }
                    ]
                });
                    
                if($scope.hasClass('layout-1') || $scope.hasClass('layout-2')){
                    var height_for = sliderFor.outerHeight(),
                    height_nav = sliderNav.outerHeight(),
                    pos = (height_nav - height_for)/2,
                    pos_disable = pos + 80;

                    if ($win.width() > 1279) {
                        if (sliderFor.find('.slick-arrow').length > 0) {
                            sliderFor.parent().addClass('arrows-visible');
                            sliderFor.parent().css('top', pos);
                        } else {
                            sliderFor.parent().addClass('arrows-disable');
                            sliderFor.parent().css('top', pos_disable);
                        }
                    } else {
                        if (sliderFor.find('.slick-arrow').length > 0) {
                            sliderFor.parent().css('top', 'unset');
                        } else {
                            sliderFor.parent().css('top', pos_disable);
                        }
                    }
                }

                if (sliderNav.find('[data-youtube]').length > 0) {
                    if (typeof window.onYouTubeIframeAPIReady === 'undefined') {
                        window.onYouTubeIframeAPIReady = scoder.initYoutubeCarousel.bind(window, sliderNav);

                        const tag = document.createElement('script');
                        tag.src = 'https://www.youtube.com/player_api';
                        const firstScriptTag = document.getElementsByTagName('script')[0];
                        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                    } else {
                        scoder.initYoutubeCarousel(sliderNav);
                    }
                }

                if (sliderNav.find('[data-vimeo]').length > 0) {
                    sliderNav.on('beforeChange', (event, slick) => {
                        var currentSlide,
                            player,
                            command;

                        currentSlide = $(slick.$slider).find('.slick-current');
                        player = currentSlide.find('iframe').get(0);

                        command = {
                            'method': 'pause',
                            'value': 'true'
                        };

                        if (player != undefined) {
                            player.contentWindow.postMessage(JSON.stringify(command), '*');
                        }
                    });

                    sliderNav.on('afterChange', (event, slick) => {
                        var currentSlide,
                            player,
                            command;

                        currentSlide = $(slick.$slider).find('.slick-current');
                        player = currentSlide.find('iframe').get(0);

                        command = {
                            'method': 'play',
                            'value': 'true'
                        };

                        if (player != undefined) {
                            player.contentWindow.postMessage(JSON.stringify(command), '*');
                        }
                    });
                }

                if (sliderNav.find('[data-mp4]').length > 0) {
                    sliderNav.on('beforeChange', (event, slick) => {
                        var currentSlide,
                            player;

                        currentSlide = $(slick.$slider).find('.slick-current');
                        player = currentSlide.find('video').get(0);

                        if (player != undefined) {
                            player.pause();
                        }
                    });

                    sliderNav.on('afterChange', (event, slick) => {
                        var currentSlide,
                            player;

                        currentSlide = $(slick.$slider).find('.slick-current');
                        player = currentSlide.find('video').get(0);

                        if (player != undefined) {
                            player.play();
                        }
                    });
                }
            }

            var productFancybox = $scope.find('[data-fancybox]');

            if(productFancybox.length > 0){
                productFancybox.fancybox({
                    buttons: [
                        "zoom",
                        "share",
                        "slideShow",
                        "fullScreen",
                        //"download",
                        "thumbs",
                        "close"
                    ],
                    loop : true,
                    thumbs : {
                        autoStart : true,
                    }
                });
            }

            if($body.hasClass('template-product')) {
                if ($scope.closest('.quickView').length) return;
                var productZoom = $scope.find('[data-zoom-image]');

                if ($win.width() > 1024) {
                    productZoom.each((index, element) => {
                        var $this = $(element);
                        
                        if ($win.width() > 1024) {
                            $this.zoom({ url: $this.attr('data-zoom-image'), touch: false });
                        } else {
                            $this.trigger('zoom.destroy');
                        }
                    });
                }
            }

            $win.on('resize', () => {
                if($scope.hasClass('layout-1') || $scope.hasClass('layout-2')){
                    if ($win.width() > 1279) {
                        setTimeout(() => {
                            if (sliderFor.find('.slick-arrow').length > 0) {
                                var height_for = sliderFor.outerHeight(),
                                    height_nav = sliderNav.outerHeight(),
                                    pos = (height_nav - height_for)/2;

                                sliderFor.parent().addClass('arrows-visible');
                                sliderFor.parent().css('top', pos);
                            } else {
                                sliderFor.parent().addClass('arrows-disable');
                            }
                        }, 200);
                    } else {
                        setTimeout(() => {
                            if (sliderFor.find('.slick-arrow').length > 0) {
                                sliderFor.parent().css('top', 'unset');
                            }
                        }, 200);
                    }
                }
            });
        },

        productVideoGallery: function($scope) {
            const videoThumbnail = $scope.find('[data-video-thumbnail]'),
                videoThumbnailLen = videoThumbnail.length,
                productVideoLen = $('.productView-video').length;

            if (videoThumbnailLen) {
                const $imageWrapper = $scope.find('.productView-image-wrapper'),
                    videoModal = $('[data-popup-video]'),
                    sliderNav = $scope.find('.productView-nav');
                let offsetTop = $imageWrapper.offset().top + $imageWrapper.outerHeight();

                if (productVideoLen) {
                    $body.addClass('has-product-video');
                }
                
                $win.on('scroll', (event) => {
                    const $targetCur = $(event.currentTarget),
                        thisVideo = $scope.find('.slick-current .productView-video'),
                        videoType = thisVideo.data('type'),
                        videoUrl = thisVideo.data('video-url');

                    if (videoUrl != undefined) {
                        if ($targetCur.scrollTop() > offsetTop) {
                            if (!videoModal.is('.is-show')) {
                                const player = sliderNav.find('.slick-slide.slick-active').data('youtube-player'),
                                    dataTime = parseInt(player.getCurrentTime()),
                                    videoContent = `<div class="fluid-width-video-wrapper" style="padding-top: 56.24999999999999%">
                                                    ${videoType == 'youtube' ? 
                                                        `<iframe
                                                            id="player"
                                                            type="text/html"
                                                            width="100%"
                                                            frameborder="0"
                                                            webkitAllowFullScreen
                                                            mozallowfullscreen
                                                            allowFullScreen
                                                            src="https://www.youtube.com/embed/${videoUrl}?autoplay=1&mute=1&start=${dataTime}">
                                                        </iframe>`
                                                        :
                                                        `<iframe 
                                                            src="https://player.vimeo.com/video/${videoUrl}?autoplay=1&mute=1" 
                                                            class="js-vimeo" 
                                                            allow="autoplay; 
                                                            encrypted-media" 
                                                            webkitallowfullscreen 
                                                            mozallowfullscreen 
                                                            allowfullscreen">
                                                        </iframe>`
                                                    }
                                                </div>`;
                                videoModal.addClass('is-show');
                                videoModal.find('.scoder-popup-content').html(videoContent);
                                $body.addClass('video-show product-video-show');
                                player.pauseVideo();
                            }
                        } else {
                            const player = sliderNav.find('.slick-slide.slick-active').data('youtube-player');
                            videoModal.removeClass('is-show');
                            videoModal.find('.scoder-popup-content').empty();
                            $body.removeClass('video-show product-video-show');
                            player.playVideo();
                        }
                    }
                });
            }
        },

        initVariantImageGroup: function($scope, enable = false) {
            if(enable){
                var inputChecked = $scope.find('[data-filter]:checked'),
                    sliderFor = $scope.find('.productView-for'),
                    sliderNav = $scope.find('.productView-nav');    

                if(inputChecked.length > 0){
                    var className = inputChecked.data('filter');

                    if(className !== undefined) {
                        sliderNav.slick('slickUnfilter');
                        sliderFor.slick('slickUnfilter');

                        if(sliderNav.find(className).length && sliderFor.find(className).length) {
                            sliderNav.slick('slickFilter', className).slick('refresh');
                            sliderFor.slick('slickFilter', className).slick('refresh');
                        }
                    }
                }

                $doc.on('change', 'input[data-filter]', (event) => {
                    var className = $(event.currentTarget).data('filter');

                    sliderNav.find('.slick-counter').remove();
                    sliderNav.slick('slickUnfilter');
                    sliderFor.slick('slickUnfilter');

                    if(className !== undefined) {

                        if(sliderNav.find(className).length && sliderFor.find(className).length) {
                            sliderNav.slick('slickFilter', className).slick('refresh');
                            sliderFor.slick('slickFilter', className).slick('refresh');
                        }
                    }
                });
            }
        },

        initYoutubeCarousel: function(slider) {
            slider.each((index, slick) => {
                const $slick = $(slick);

                if ($slick.find('[data-youtube]').length > 0) {
                    $slick.addClass('slick-slider--video');

                    scoder.initYoutubeCarouselEvent(slick);
                }
            });
        },

        initYoutubeCarouselEvent: function(slick){
            var $slick = $(slick),
                $videos = $slick.find('[data-youtube]');

            bindEvents(slick);

            function bindEvents() {
                if ($slick.hasClass('slick-initialized')) {
                    onSlickImageInit($slick, $videos);
                }

                $doc.on('init', $slick, onSlickImageInit);
                $doc.on('beforeChange', $slick, onSlickImageBeforeChange);
                $doc.on('afterChange', $slick, onSlickImageAfterChange);
            }

            function onPlayerReady(event) {
                $(event.target.getIframe()).closest('.slick-slide').data('youtube-player', event.target);

                setTimeout(function(){
                    if ($(event.target.getIframe()).closest('.slick-slide').hasClass('slick-active')) {
                        $slick.slick('slickPause');
                        event.target.playVideo();
                    }
                }, 200);
            }

            function onPlayerStateChange(event) {
                if (event.data === YT.PlayerState.PLAYING) {
                    $slick.slick('slickPause');
                }

                if (event.data === YT.PlayerState.ENDED) {
                    $slick.slick('slickNext');
                }
            }

            function onSlickImageInit() {
                $videos.each((j, vid) => {
                    const $vid = $(vid);
                    const id = `youtube_player_${Math.floor(Math.random() * 100)}`;

                    $vid.attr('id', id);

                    const player = new YT.Player(id, {
                        host: 'http://www.youtube.com',
                        videoId: $vid.data('youtube'),
                        wmode: 'transparent',
                        playerVars: {
                            autoplay: 0,
                            controls: 0,
                            disablekb: 1,
                            enablejsapi: 1,
                            fs: 0,
                            rel: 0,
                            showinfo: 0,
                            iv_load_policy: 3,
                            modestbranding: 1,
                            wmode: 'transparent',
                        },
                        events: {
                            onReady: onPlayerReady,
                            onStateChange: onPlayerStateChange,
                        },
                    });
                });
            }

            function onSlickImageBeforeChange(){
                const player = $slick.find('.slick-slide.slick-active').data('youtube-player');

                if (player) {
                    player.stopVideo();
                    $slick.removeClass('slick-slider--playvideo');
                }
            }

            function onSlickImageAfterChange(){
                const player = $slick.find('.slick-slide.slick-active').data('youtube-player');

                if (player) {
                    $slick.slick('slickPause');
                    $slick.addClass('slick-slider--playvideo');
                    player.playVideo();
                }
            }
        },

        productSizeChart: function($scope){
            window.sizeChart = function() {
                var sizeChartBtn =  $scope.find('[data-open-size-chart-popup]');

                sizeChartBtn.on('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    document.body.classList.add('size-chart-show');
                    if (document.body.classList.contains('quick-view-show')) {
                        $('.scoder-popup-content .scoder-size-chart-popup').addClass('is-show');
                    }
                    else {
                        $('#MainContent .scoder-size-chart-popup').addClass('is-show');
                    }
                });

                $doc.on('click', '[data-close-size-chart-popup]', () => {
                    $body.removeClass('size-chart-show');
                    $('.scoder-size-chart-popup').removeClass('is-show');
                });

                $doc.on('click', (event) => {
                    if ($body.hasClass('size-chart-show')) {
                        if (($(event.target).closest('[data-open-size-chart-popup]').length === 0) && ($(event.target).closest('[data-size-chart-popup]').length === 0)) {
                            $body.removeClass('size-chart-show');
                        }
                    }
                });
            };

            var quickViewShow = document.body.classList.contains('quick-view-show'),
                productSizeChart = $('.scoder-productView .productView-sizeChart').length;

            if (document.body.classList.contains('template-product')) {
                if (!quickViewShow && productSizeChart) {
                    window.sizeChart();
                } else if (quickViewShow && productSizeChart === 0) {
                    window.sizeChart();
                }
            } else {
                window.sizeChart();
            }
        },

        productLastSoldOut: function($scope) {
            var wrapper = $scope.find('[data-sold-out-product]');

            if (wrapper.length > 0) {
                var numbersProductList = wrapper.data('item').toString().split(','),
                    numbersProductItem = Math.floor(Math.random() * numbersProductList.length),
                    numbersHoursList = wrapper.data('hours').toString().split(','),
                    numbersHoursItem = Math.floor(Math.random() * numbersHoursList.length);

                wrapper.find('[data-sold-out-number]').text(numbersProductList[numbersProductItem]);
                wrapper.find('[data-sold-out-hours]').text(numbersHoursList[numbersHoursItem]);
                wrapper.show();
            }
        },

        productCustomerViewing: function($scope) {
            var wrapper = $scope.find('[data-customer-view]');

            if (wrapper.length > 0) {
                var numbersViewer = wrapper.data('customer-view'),
                    numbersViewerList =  JSON.parse('[' + numbersViewer + ']'),
                    numbersViewerTime = wrapper.data('customer-view-time'),
                    timeViewer =  parseInt(numbersViewerTime) * 1000;
                
                setInterval(function() {
                    var numbersViewerItem = (Math.floor(Math.random() * numbersViewerList.length));

                    wrapper.find('.text').text(window.customer_view.text.replace('[number]', numbersViewerList[numbersViewerItem]));
                }, timeViewer);
            }
        },

        productCountdown: function($scope){
            var wrapper = $scope.find('[data-countdown-id]'),
                countDown = wrapper.data('countdown'),
                countDownDate = new Date(countDown).getTime(),
                countDownText = window.countdown.text;
            

            if(wrapper.length > 0) {
                var countdownfunction = setInterval(function() {
                    var now = new Date().getTime(),
                        distance = countDownDate - now;

                    if (distance < 0) {
                        clearInterval(countdownfunction);
                        wrapper.remove();
                    } else {
                        var days = Math.floor(distance / (1000 * 60 * 60 * 24)),
                            hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                            minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                            seconds = Math.floor((distance % (1000 * 60)) / 1000),
                            strCountDown;

                        if (wrapper.is('.style-2, .style-3')) {
                            strCountDown = '<span class="num">'+days+'<span>'+ window.countdown.day_2 +'</span></span>\
                                <span class="num">'+hours+'<span>'+ window.countdown.hour_2 +'</span></span>\
                                <span class="num">'+minutes+'<span>'+ window.countdown.min_2 +'</span></span>\
                                <span class="num">'+seconds+'<span>'+ window.countdown.sec_2 +'</span></span>';
                        }
                        else {
                            strCountDown = '<span class="num">'+days+'<span>'+ window.countdown.day +'</span></span>\
                                <span class="num">'+hours+'<span>'+ window.countdown.hour +'</span></span>\
                                <span class="num">'+minutes+'<span>'+ window.countdown.min +'</span></span>\
                                <span class="num">'+seconds+'<span>'+ window.countdown.sec +'</span></span>';
                        }

                        wrapper.html(strCountDown);
                        wrapper.addClass('show');
                    }
                }, 1000);
            }
        },

        productCustomCursor: function($scope){
            if ($('.cursor-wrapper').length == 0) return;
            const { Back } = window;

            this.cursorWrapper = document.querySelector(".cursor-wrapper");
            this.innerCursor = document.querySelector(".custom-cursor__inner");
            this.outerCursor = document.querySelector(".custom-cursor__outer");

            this.cursorWrapperBox = this.cursorWrapper.getBoundingClientRect();
            this.innerCursorBox = this.innerCursor.getBoundingClientRect();
            this.outerCursorBox = this.outerCursor.getBoundingClientRect();

            document.addEventListener("mousemove", e => {
                this.clientX = e.clientX;
                this.clientY = e.clientY;
            });

            const render = () => {
                TweenMax.set(this.cursorWrapper, {
                    x: this.clientX,
                    y: this.clientY
                });
                requestAnimationFrame(render);
            };
            requestAnimationFrame(render);

            this.fullCursorSize = 60;
            this.enlargeCursorTween = TweenMax.to(this.outerCursor, 0.3, {
                width: this.fullCursorSize,
                height: this.fullCursorSize,
                ease: this.easing,
                paused: true
            });

            const handleMouseEnter = () => {
                this.enlargeCursorTween.play();
                $('.cursor-wrapper').addClass('handleMouseEnter').removeClass('handleMouseLeave');
            };

            const handleMouseLeave = () => {
                this.enlargeCursorTween.reverse();
                $('.cursor-wrapper').addClass('handleMouseLeave').removeClass('handleMouseEnter');
            };

            const gridItems = document.querySelectorAll(".productView-image");
            gridItems.forEach(el => {
                if (el?.querySelector('.productView-video')) return;
                el.addEventListener("mouseenter", handleMouseEnter);
                el.addEventListener("mouseleave", handleMouseLeave);
            });

            this.bumpCursorTween = TweenMax.to(this.outerCursor, 0.1, {
                scale: 0.7,
                paused: true,
                onComplete: () => {
                    TweenMax.to(this.outerCursor, 0.2, {
                        scale: 1,
                        ease: this.easing
                    });
                }
            });

            $(document).on('mouseover', '[data-cursor-image]', (event) => {
                var $target = $(event.currentTarget),
                    imagesInView = new Array();

                imagesInView.push($target.attr('data-index'));
                $("#count-image").text(imagesInView[0]);
            });

            $.fn.isInViewport = function(excludePartials) {
                var elementTop = $(this).offset().top;
                var elementBottom = elementTop + $(this).height();

                var viewportTop = $(document).scrollTop();
                var viewportBottom = viewportTop + $(window).height();

                if (excludePartials) {
                    var bottomVisible = (elementBottom - viewportTop) / $(this).height();
                    var isInView = elementBottom > viewportTop && elementTop < viewportBottom;

                    return isInView && bottomVisible > 0.5;
                }

                return elementBottom > viewportTop && elementTop < viewportBottom;
            };

            
            if ($('.product-full-width').length > 0 || $('.product-full-width-2').length > 0) {
                $(window).on('resize scroll', function() {
                    var imagesInView = new Array();
                    $('.productView-image').each(function() {
                        if ($(this).isInViewport(true)) {
                            imagesInView.push($(this).attr('data-index'));
                            $("#count-image").text(imagesInView[0]);
                        }
                    });
                });
            }
        },

        initWishlist: function() {
            if(window.wishlist.show){
                scoder.setLocalStorageProductForWishlist();

                $doc.on('click', '[data-wishlist]', (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    if (!$(event.currentTarget).hasClass('is-in-grid')) {
                        $('[data-wishlist-items-display]').removeClass('is-loaded');
                    }

                    var $target = $(event.currentTarget),
                        id = $target.data('product-id'),
                        handle = $target.data('wishlist-handle'),
                        wishlistList = localStorage.getItem('wishlistItem') ? JSON.parse(localStorage.getItem('wishlistItem')) : [];
                        index = wishlistList.indexOf(handle),
                        wishlistContainer = $('[data-wishlist-container]');
                        wishlistLayout = wishlistContainer.attr('data-wishlist-layout');

                    if(!$target.hasClass('wishlist-added')){
                        $target
                            .addClass('wishlist-added')
                            .find('.text')
                            .text(window.wishlist.added);

                        if(wishlistContainer.length > 0) {
                            const addEvent = new CustomEvent('addwishlistitem', { detail: { handle } , bubbles: true });
                            document.dispatchEvent(addEvent);
                        }

                        wishlistList.push(handle);
                        localStorage.setItem('wishlistItem', JSON.stringify(wishlistList));
                        
                        const updateWishlistMailEvent = new CustomEvent('updatewishlistmail', { bubbles: true });
                        document.dispatchEvent(updateWishlistMailEvent); 
                    } else {
                        $target
                            .removeClass('wishlist-added')
                            .find('.text')
                            .text(window.wishlist.add);
                        if(wishlistContainer.length > 0) {
                            if($('[data-wishlist-added="wishlist-'+ id +'"]').length > 0) {
                                $('[data-wishlist-added="wishlist-'+ id +'"]').remove();
                                const icon = $(`[data-wishlist][data-product-id=${id}]`);
                                const productCard = icon.closest('.product');
                                productCard.remove();
                            }           
                        }

                        wishlistList.splice(index, 1);
                        localStorage.setItem('wishlistItem', JSON.stringify(wishlistList));

                        const updatePaginationEvent = new CustomEvent('updatepagination', { bubbles: true })
                        document.dispatchEvent(updatePaginationEvent);
                        
                        if(wishlistContainer.length > 0) {
                            wishlistList = localStorage.getItem('wishlistItem') ? JSON.parse(localStorage.getItem('wishlistItem')) : [];

                            if (wishlistList.length > 0) {
                                const updateWishlistMailEvent = new Event('updatewishlistmail', { bubbles: true })
                                document.dispatchEvent(updateWishlistMailEvent);
                            } else {
                                $('[data-wishlist-container]')
                                    .addClass('is-empty')
                                    .html(`\
                                    <div class="wishlist-content-empty text-center">\
                                        <h5 class="wishlist-no-heading-text">Your Wishlist is empty</h5>\
                                        <span class="wishlist-content-text">${window.wishlist.empty}</span>\
                                        <div class="wishlist-content-actions">\
                                            <a class="button button-2 button-continue" href="${window.routes.collection_all}">\
                                                ${window.wishlist.continue_shopping}\
                                            </a>\
                                        </div>\
                                    </div>\
                                `);

                                $('[data-wishlist-footer]').hide();
                            }   
                        }
                    }
                    $('[data-wishlist-count]').text(wishlistList.length);
                    scoder.setProductForWishlist(handle);
                })
            }
        },

        calculateCard06Padding() {

            const cardAction = document.querySelector('.card .card-action.card-grid__hidden');
            cardAction.classList.remove('card-grid__hidden');
            const padding = cardAction.scrollHeight;

            document.querySelector('[data-wishlist-items-grid-display]').style.setProperty('--card-06-padding', padding + 'px');
            cardAction.classList.add('card-grid__hidden');
        },

        setProductForWishlist: function(handle){
            var wishlistList = JSON.parse(localStorage.getItem('wishlistItem')),
                item = $('[data-wishlist-handle="'+ handle +'"]'),
                index = wishlistList?.indexOf(handle);

            if (index == null || wishlistList == null) return;
            
            if(index >= 0) {
                item
                    .addClass('wishlist-added')
                    .find('.text')
                    .text(window.wishlist.added)
            } else {
                item
                    .removeClass('wishlist-added')
                    .find('.text')
                    .text(window.wishlist.add);
            }
        },

        setLocalStorageProductForWishlist: function() {
            var wishlistList = localStorage.getItem('wishlistItem') ? JSON.parse(localStorage.getItem('wishlistItem')) : [];
            localStorage.setItem('wishlistItem', JSON.stringify(wishlistList));

            if (wishlistList.length > 0) {
                wishlistList = JSON.parse(localStorage.getItem('wishlistItem'));
                
                wishlistList.forEach((handle) => {
                    scoder.setProductForWishlist(handle);
                });
            }
            $('[data-wishlist-count]').text(wishlistList.length);
        },

        initCountdown: function () {
          var countdownAnnouncementElm = $('[data-countdown-announcement]'),
              countdownElm = $('[data-countdown]').not('[data-countdown-id]');

            if (countdownAnnouncementElm.length) {
                countdownAnnouncementElm.each(function () {
                    var self = $(this),
                        countdownAnnouncement = self.data('countdown-value'),
                        countdownAnnouncementDate = new Date(countdownAnnouncement).getTime();

                    var countdownAnnouncementFunction = setInterval(function() {
                        var now = new Date().getTime(),
                            distance = countdownAnnouncementDate - now;

                        if (distance < 0) {
                            clearInterval(countdownAnnouncementFunction);
                            if (self.hasClass('hide--countdown')) {
                                self.remove();
                            }
                            else {
                                const thisItem = self.parents('.announcement-bar__message'),
                                    thisBar = self.parents('[data-announcement-bar]');
                                thisBar.is('.slick-initialized') ? thisBar.slick('slickRemove', thisItem.data('slick-index')) : thisItem.remove();
                            }
                        } else {
                             var days = Math.floor(distance / (1000 * 60 * 60 * 24)),
                                hours = `0${Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}`.slice(-2),
                                minutes = `0${Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))}`.slice(-2),
                                seconds = `0${Math.floor((distance % (1000 * 60)) / 1000)}`.slice(-2),
                                strCountDown = '';
                            
                            strCountDown = '<div class="clock-item"><span class="num abc">'+days+'</span><span class="text">'+ window.countdown.days +'</span></div>\
                                            <div class="clock-item"><span class="num abc">'+hours+'</span><span class="text">'+ window.countdown.hours +'</span></div>\
                                            <div class="clock-item"><span class="num abc">'+minutes+'</span><span class="text">'+ window.countdown.mins +'</span></div>\
                                            <div class="clock-item"><span class="num abc">'+seconds+'</span><span class="text">'+ window.countdown.secs +'</span></div>';
                          
                            self.html(strCountDown);
                        }
                    }, 1000);
                });
            }

            if (countdownElm.length) {
                countdownElm.each(function () {
                    var self = $(this),
                        countDown = self.data('countdown-value'),
                        countDownDate = new Date(countDown).getTime();
                        
                    var countdownfunction = setInterval(function() {
                        var now = new Date().getTime(),
                            distance = countDownDate - now;

                        if (distance < 0) {
                            clearInterval(countdownfunction);
                            if (self.hasClass('hide--countdown')) {
                                self.remove();
                            }
                            else {
                                self.parents('.shopify-section').remove();
                            }
                        } else {
                            var days = Math.floor(distance / (1000 * 60 * 60 * 24)),
                                hours = `0${Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}`.slice(-2),
                                minutes = `0${Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))}`.slice(-2),
                                seconds = `0${Math.floor((distance % (1000 * 60)) / 1000)}`.slice(-2),
                                strCountDown = '';
                            if (self.hasClass('product-countdown-block')) {
                                if($('.scoder-block-header').hasClass('countdown_style_2')){
                                    strCountDown = '<div class="clock-item"><span class="num xyz">'+days+ window.countdown.d +'</span><span class="icon">:</span></div>\
                                                <div class="clock-item"><span class="num xyz">'+hours+ window.countdown.h +'</span><span class="icon">:</span></div>\
                                                <div class="clock-item"><span class="num xyz">'+minutes+ window.countdown.m +'</span><span class="icon">:</span></div>\
                                                <div class="clock-item"><span class="num xyz">'+seconds+ window.countdown.s +'</span><span class="icon"></span></div>';
                                } else{
                                    strCountDown = `<div class="clock-item"><span class="num asd"><span class="count">${days}</span> <span class="day">Days</span></span></div>
                                    <div class="clock-item"><span class="num asd"><span class="count">${hours}</span> <span class="day">Hrs</span></span></div>
                                    <div class="clock-item"><span class="num asd"><span class="count">${minutes}</span> <span class="day">Mins</span></span></div>
                                    <div class="clock-item"><span class="num asd"><span class="count">${seconds}</span> <span class="day">Secs</span></span></div>`;
                                }
                            } else {
                                strCountDown = '<div class="clock-item"><span class="num mnb">'+days+'</span><span class="text">'+ window.countdown.days +'</span></div>\
                                                <div class="clock-item"><span class="num mnb">'+hours+'</span><span class="text">'+ window.countdown.hours +'</span></div>\
                                                <div class="clock-item"><span class="num mnb">'+minutes+'</span><span class="text">'+ window.countdown.mins +'</span></div>\
                                                <div class="clock-item"><span class="num mnb">'+seconds+'</span><span class="text">'+ window.countdown.secs +'</span></div>';
                            }
                            self.html(strCountDown);
                        }
                    }, 1000);
                });
            }
        },

        toggleSidebarMobile: function() {
            $doc.on('click', '[data-sidebar]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                $body.addClass('open-mobile-sidebar');
              
            });

            $doc.on('click', '[data-close-sidebar]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                $body.removeClass('open-mobile-sidebar');
            });

            $doc.on('click', (event) => {
                if($body.hasClass('open-mobile-sidebar')){
                    if (($(event.target).closest('[data-sidebar]').length === 0) && ($(event.target).closest('#scoder-sidebar').length === 0)) {
                        $body.removeClass('open-mobile-sidebar');
                    }
                }
            });
        },
      
        articleGallery: function() {
            const $gallery = $('.articleGallery-block'),
                $gallerySlider = $('.articleGallery-slider'),
                galleryLength = $gallery.length,
                col = $gallerySlider.data('col');

            if (galleryLength > 0 && $gallerySlider.not('.slick-initialized')) {
                $gallerySlider.slick({
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: true,
                    arrows: true,
                    infinite: false,
                    mobileFirst: true,
                    focusOnSelect: false,
                    nextArrow: window.arrows.icon_next,
                    prevArrow: window.arrows.icon_prev,
                    rtl: window.rtl_slick,
                    responsive: [
                        {
                            breakpoint: 767,
                            settings: {
                                slidesToShow: col,
                                slidesToScroll: col
                            }
                        },
                        {
                            breakpoint: 319,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 2
                            }
                        }
                    ]
                });
            }
        },

        initInfiniteScrolling: function(){
            if ($('.pagination-infinite'.length > 0)) {
                $win.on('scroll load', () => {
                    var currentScroll = $win.scrollTop(),
                        pageInfinite = $('.pagination-infinite'),
                        linkInfinite = pageInfinite.find('[data-infinite-scrolling]'),
                        position; 

                    if(linkInfinite.length > 0 && !linkInfinite.hasClass('is-loading')){
                        position = pageInfinite.offset().top - 500;
                        
                        if (currentScroll > position) {
                            var url = linkInfinite.attr('href');

                            scoder.doAjaxInfiniteScrollingGetContent(url, linkInfinite);
                        }
                    }
                });
            }

            $doc.on('click', '[data-infinite-scrolling]', (event) => {
                var linkInfinite = $(event.currentTarget),
                    url = linkInfinite.attr('href');

                event.preventDefault();
                event.stopPropagation();

                scoder.doAjaxInfiniteScrollingGetContent(url, linkInfinite);
            });
        },

        doAjaxInfiniteScrollingGetContent: function(url, link){
            $.ajax({
                type: 'GET',
                url: url,
                beforeSend: function () {
                    link.text(link.attr('data-loading-more'));
                    link.addClass('is-loading');
                    // document.getElementById('CollectionProductGrid').querySelector('.collection').classList.add('is-loading');
                    // $body.addClass('has-scoder-loader');
                },
                success: function (data) {
                    scoder.ajaxInfiniteScrollingMapData(data);
                },
                error: function (xhr, text) {
                    alert($.parseJSON(xhr.responseText).description);
                },
                complete: function () {
                    link.text(link.attr('data-load-more'));
                    link.removeClass('is-loading');
                    // document.getElementById('CollectionProductGrid').querySelector('.collection').classList.remove('is-loading');
                    // $body.removeClass('has-scoder-loader');
                    if (document.querySelector('.collection-masonry')) {
                        resizeAllGridItems();
                    }
                }
            });
        },

        initCollapseSidebarBlock: function (){
            $doc.on('click', '.sidebarBlock-headingWrapper .sidebarBlock-heading', (event) => {
                var $target = $(event.currentTarget),
                    $blockCollapse = $target.parent().siblings(),
                    $sidebarBlock = $target.parents('.sidebarBlock');

                if($target.hasClass('is-clicked')){
                    $target.removeClass('is-clicked');
                    $blockCollapse.slideUp('slow');
                } else {
                    $target.addClass('is-clicked');
                    $blockCollapse.slideDown('slow');

                    if ($sidebarBlock.hasClass('sidebar-product')) {
                        $sidebarBlock.find('.products-carousel').slick('refresh');
                    }
                }
            });
        },

        initCategoryActive: function(){
            if ($('.all-categories-list').length > 0) {
                $doc.on('click', '.all-categories-list .icon-dropdown', (event) => {
                    var $target = $(event.currentTarget).parent();

                    $target.siblings().removeClass('is-clicked current-cate');
                    $target.toggleClass('is-clicked');
                    $target.siblings().find('> .dropdown-category-list').slideUp('slow');
                    $target.find('> .dropdown-category-list').slideToggle('slow');
                });

                $('.all-categories-list li').each((index, element) =>{
                    if ($(element).hasClass('current-cate')) {
                        // $(element).find('> .dropdown-category-list').slideToggle('slow');
                    }
                });
            }
        },

        productBlockSilderSidebar: function() {
            var productGrid = $('[data-product-slider-sidebar]'),
                itemToShow = productGrid.data('item-to-show'),
                itemDots = productGrid.data('item-dots'),
                itemArrows = productGrid.data('item-arrows');

            if(productGrid.length > 0) {
                if(productGrid.not('.slick-initialized')) {
                    productGrid.slick({
                        mobileFirst: true,
                        adaptiveHeight: true,
                        vertical: false,
                        infinite: false,
                        slidesToShow: itemToShow,
                        slidesToScroll: 1,
                        arrows: itemArrows,
                        dots: itemDots,
                        autoplay: true,
                        autoplaySpeed: 2000,
                        nextArrow: window.arrows.icon_next,
                        prevArrow: window.arrows.icon_prev,
                        rtl: window.rtl_slick,
                    });
                }
            }
        },

        productBlockSilderArticle: function() {
            var productGrid = $('[data-product-slider-article]'),
                itemToShow = productGrid.data('item-to-show'),
                itemDots = productGrid.data('item-dots'),
                itemArrows = productGrid.data('item-arrows');

            if(productGrid.length > 0) {
                if(productGrid.not('.slick-initialized')) {
                    productGrid.slick({
                        adaptiveHeight: true,
                        vertical: false,
                        infinite: false,
                        slidesToShow: itemToShow,
                        slidesToScroll: 1,
                        arrows: itemArrows,
                        dots: itemDots,
                        nextArrow: window.arrows.icon_next,
                        prevArrow: window.arrows.icon_prev,
                        rtl: window.rtl_slick,
                        responsive: [{
                                breakpoint: 992,
                                settings: {
                                    slidesToShow: 3,
                                    slidesToScroll: 1,
                                }
                            },
                            {
                                breakpoint: 551,
                                settings: {
                                    slidesToShow: 2,
                                    slidesToScroll: 1,
                                }
                            }
                        ]
                    });
                }
            }
        },

        articleGallery: function() {
            const $gallery = $('.articleGallery-block'),
                $gallerySlider = $('.articleGallery-slider'),
                galleryLength = $gallery.length,
                col = $gallerySlider.data('col');

            if (galleryLength > 0 && $gallerySlider.not('.slick-initialized')) {
                $gallerySlider.slick({
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: true,
                    arrows: true,
                    infinite: false,
                    mobileFirst: true,
                    focusOnSelect: false,
                    nextArrow: window.arrows.icon_next,
                    prevArrow: window.arrows.icon_prev,
                    rtl: window.rtl_slick,
                    responsive: [
                        {
                            breakpoint: 767,
                            settings: {
                                slidesToShow: col,
                                slidesToScroll: col
                            }
                        },
                        {
                            breakpoint: 319,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 2
                            }
                        }
                    ]
                });
            }
        },

        doAjaxInfiniteScrollingGetContent: function(url, link){
            $.ajax({
                type: 'GET',
                url: url,
                beforeSend: function () {
                    link.text(link.attr('data-loading-more'));
                    link.addClass('is-loading');
                },
                success: function (data) {
                    scoder.ajaxInfiniteScrollingMapData(data);
                },
                error: function (xhr, text) {
                    alert($.parseJSON(xhr.responseText).description);
                },
                complete: function () {
                    link.text(link.attr('data-load-more'));
                    link.removeClass('is-loading');
                }
            });
        },

        ajaxInfiniteScrollingMapData: function(data){
            var currentTemplate = $('#CollectionProductGrid'),
                currentProductListing = currentTemplate.find('.productListing'),
                currentPagination = currentTemplate.find('.pagination'),
                newTemplate = $(data).find('#CollectionProductGrid'),
                newProductListing = newTemplate.find('.productListing'),
                newPagination = newTemplate.find('.pagination'),
                newProductItem = newProductListing.children('.product');
                
            if (newProductItem.length > 0) {
                currentProductListing.append(newProductItem);
                currentPagination.replaceWith(newPagination);

                $('[data-total-start]').text(1);

                if(window.compare.show){
                    var $compareLink = $('a[data-compare-link]');
                    scoder.setLocalStorageProductForCompare($compareLink);
                }

                if(window.wishlist.show){
                    scoder.setLocalStorageProductForWishlist();
                }

                if (scoder.checkNeedToConvertCurrency()) {
                    Currency.convertAll(window.shop_currency, $('#currencies .active').attr('data-currency'), 'span.money', 'money_format');
                }
            }
        },

        initQuickShopProductList: function() {
            $doc.on('click', '[data-open-quickshop-popup-list]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                var handle = $(event.currentTarget).data('product-handle'),
                    product = $(event.currentTarget).closest('.card');

                if(!product.hasClass('quick-shop-show')){
                    scoder.updateContentQuickShop(product, handle);
                }
            });

            $doc.on('click', '[data-close-quickshop-popup-list]', (event) => {
                event.preventDefault();
                event.stopPropagation();

                var product = $(event.currentTarget).closest('.card');

                product.removeClass('quick-shop-show');
                product.find('.card-popup-content').empty();
            });

            $doc.on('click', (event) => {
                if($('.card').hasClass('quick-shop-show')){
                    if (($(event.target).closest('[data-open-quickshop-popup-list]').length === 0) && ($(event.target).closest('.card-popup').length === 0)){
                        $('.card').removeClass('quick-shop-show');
                        $('.card').find('.card-popup-content').empty();
                    }
                }
            });
        },

        updateContentQuickShop: function(product, handle) {
            var popup = product.find('.card-popup'),
                popupContent = popup.find('.card-popup-content');

            $.ajax({
                type: 'get',
                url: window.routes.root + '/products/' + handle + '?view=ajax_quick_shop',
                beforeSend: function () {
                    $('.card').removeClass('quick-shop-show');
                },
                success: function (data) {
                    popupContent.append(data);
                },
                error: function (xhr, text) {
                    alert($.parseJSON(xhr.responseText).description);
                },
                complete: function () {
                    product.addClass('quick-shop-show');
                }
            });
        },

        toggleVariantsForExpressOrder: function () {
            var toggleVariant = '[data-toggle-variant]';

            $(document).on('click', toggleVariant, function (e) {
                e.preventDefault();
                e.stopPropagation();

                var self = $(this),
                    curVariants = self.data('target');

                if(self.hasClass('show-options-btn')) {
                    self.text(window.inventory_text.hide_options);
                    $(curVariants).slideDown(700, function () {
                        self.addClass('hide-options-btn').removeClass('show-options-btn');
                    });
                }
                else {
                    self.text(window.inventory_text.show_options);
                    $(curVariants).slideUp(700, function () {
                        self.addClass('show-options-btn').removeClass('hide-options-btn');
                    });
                };
            })
        },

        initExpressOrderAddToCart: function() {
            var addToCartSlt = '[data-express-addtocart]';

            $(document).off('click.addToCartExpress', addToCartSlt).on('click.addToCartExpress', addToCartSlt, function (e) {
                e.preventDefault();

                var self = $(this);

                if (self.attr('disabled') != 'disabled') {
                    var productItem = self.closest('.product-item');

                    if(productItem.length == 0) {
                        productItem = self.closest('.col-options');
                    }

                    var form = productItem.find('form');
                    var variant_id = form.find('select[name=id]').val();

                    if (!variant_id) {
                        variant_id = form.find('input[name=id]').val();
                    };

                    var quantityElm = productItem.find('input[name=quantity]');

                    if(quantityElm.length == 0) {
                        quantityElm = productItem.siblings('.col-qtt').find('input[name=quantity]');
                    }

                    var quantity = quantityElm.val();
                    if (!quantity) {
                        quantity = 1;
                    };

                    if(parseInt(quantity) !== 0) {
                        if (window.ajax_cart == 'none') {
                            form.submit();
                        } else {
                            scoder.expressAjaxAddToCart(variant_id, quantity, self, form);
                            form.next('.feedback-text').show();
                        }
                    }
                    else {
                        form.next('.feedback-text').text('Quantity cannot be blank').show();
                    }
                }
                return false;
            });
        },

        expressAjaxAddToCart: function(variant_id, quantity, cartBtn, form) {
            $.ajax({
                type: "post",
                url: "/cart/add.js",
                data: 'quantity=' + quantity + '&id=' + variant_id,
                dataType: 'json',

                beforeSend: function() {
                    window.setTimeout(function() {
                        cartBtn.text(window.inventory_text.adding +"...");
                    }, 100);
                },

                success: function(msg) {
                    window.setTimeout(function() {
                        cartBtn.text(window.inventory_text.thank_you);
                        cartBtn.addClass('add_more');
                        form.next('.feedback-text').text(window.inventory_text.cart_feedback).addClass('is-added');
                    }, 600);
                    window.setTimeout(function() {
                        cartBtn.text(window.inventory_text.add_more + "...");
                    }, 1000);

                    switch (window.after_add_to_cart.type) {
                        case 'cart':
                            scoder.redirectTo(window.routes.cart);

                            break;
                        case 'quick_cart':
                            if(window.quick_cart.show){
                                Shopify.getCart((cart) => {
                                        $body.addClass('cart-sidebar-show');
                                        scoder.updateSidebarCart(cart);
                                });
                            } else {
                                scoder.redirectTo(window.routes.cart);
                            }

                            break;
                    }
                },

                error: function(xhr, text) {
                    alert($.parseJSON(xhr.responseText).description);
                    window.setTimeout(function() {
                        cartBtn.text(window.inventory_text.add_to_cart);
                    }, 400);
                }
            });
        },

        initProductBundle: function() {
            var productBundle = $('[data-product-bundle]'),
                bundleList = productBundle.find('[data-bundle-slider]'),
                dots = bundleList.data('dots'),
                arrows = bundleList.data('arrows');

            if(bundleList.length > 0){
                if(!bundleList.hasClass('slick-initialized')){
                    bundleList.slick({
                        dots: true,
                        arrows: arrows,
                        slidesToShow: 2,
                        slidesToScroll: 1,
                        mobileFirst: true,
                        infinite: false,
                        nextArrow: window.arrows.icon_next,
                        prevArrow: window.arrows.icon_prev,
                        rtl: window.rtl_slick,
                        responsive: [
                            {
                                breakpoint: 1200,
                                settings: {
                                    slidesToShow: 4,
                                    slidesToScroll: 1,
                                    dots: dots
                                }
                            },
                            {
                                breakpoint: 551,
                                settings: {
                                    slidesToShow: 3,
                                    slidesToScroll: 1,
                                    dots: dots
                                }
                            }
                        ]
                    });

                    productBundle.find('.bundle-product-wrapper').removeClass('has-scoder-block-loader');

                    bundleList.on('afterChange', function(){
                        bundleList.find('.bundle-product-item').removeClass('is-open');
                    });
                }
            }
        },

        initProductReviewSection: function() {
            $doc.ready(() => {
                setTimeout(() => {
                    const $reviewTabContent = $('.productView-review .spr-content'),
                        $thisReviewSection = $('.shopify-app-block .spr-content');
        
                    if ($reviewTabContent && $thisReviewSection) {
                        const reviewContent = $reviewTabContent.html();
                        $thisReviewSection.html(reviewContent);
                    }
                }, 1000);
            });
        },

        initDynamicBrowserTabTitle: function() {
            if(window.dynamic_browser_title.show){
                var pageTitleContent = document.title,
                    newPageTitleContent = window.dynamic_browser_title.text;

                window.onblur = function () {
                    document.title = window.dynamic_browser_title.text;
                }

                window.onfocus = function () {
                    document.title = pageTitleContent;
                }
            }
        },

        initWarningPopup: function() {
            this.warningPopup = document.querySelector('[data-warning-popup]');
            this.warningPopupContent = this.warningPopup.querySelector('[data-scoder-warning-content]');
            this.warningPopupCloseButton = this.warningPopup.querySelector('[data-close-warning-popup]');
            this.warningPopupCloseButton.addEventListener('click', () => {
                document.body.classList.remove('has-warning');
            })
            
            this.warningTime = 3000
            this.warningTimeout = undefined;

            window.warningTimeout = this.warningTimeout;
        },  

        showWarning: function(content, time = this.warningTime) {
            if (this.warningTimeout) {
                clearTimeout(this.warningTimeout);
            }

            this.warningPopupContent.textContent = content;
            document.body.classList.add('has-warning');
            
            if (time) {
                this.warningTimeout = setTimeout(() => {
                    document.body.classList.remove('has-warning');
                }, time);
            }
        },

        backgroundOverlayHoverEffect: function() {
            const backgroundOverlay = document.querySelector('.background-overlay')
            const backgroundCursorWrapper = document.querySelector('.background-cursor-wrapper')

            const enlargeCursor = () => {
                backgroundCursorWrapper.classList.add('enlarge-cursor')
            }

            const dwindleCursor = () => {
                backgroundCursorWrapper.classList.remove('enlarge-cursor')
            }

            const setCursorPosition = (clientX, clientY) => {
                requestAnimationFrame(() => {
                    backgroundCursorWrapper.style.setProperty('--translate-y', clientY)
                    backgroundCursorWrapper.style.setProperty('--translate-x', clientX)
                })
            }

            const handleMouseMove = (e) => {
                setCursorPosition(e.clientX, e.clientY)                
            }

            const handleMouseEnter = (e) => {
                setCursorPosition(e.clientX, e.clientY)
                enlargeCursor()
            }
            
            const handleMouseLeave = e => {
                setCursorPosition(e.clientX, e.clientY)
                backgroundCursorWrapper.removeEventListener('mousemove', handleMouseMove)
                dwindleCursor()
            }

            backgroundOverlay.addEventListener('mouseenter', handleMouseEnter)
            backgroundOverlay.addEventListener('mouseleave', handleMouseLeave)
            backgroundOverlay.addEventListener('mousemove', handleMouseMove)
            backgroundOverlay.addEventListener('click', dwindleCursor)
        },

        productBlockScroller: function (wrapper) {
            const { Back } = window;
            const easingEffect = Back.easeInOut.config(1.7);

            let cursorWrapper = wrapper.get(0)?.querySelector('.products-cursor');

            if(!cursorWrapper) return;

            let innerCursor = cursorWrapper.querySelector('.products-cursor__inner'),
                imageCursor = cursorWrapper.querySelector('.products-cursor__image'),
                iconCursor = cursorWrapper.querySelector('.products-cursor__icon'),
                itemTween = wrapper.get(0)?.querySelectorAll('.scoder-block-content.is-scroll, .products-load.is-scroll'),
                itemNotTween = wrapper.get(0)?.querySelectorAll('.card-product__group, .card-action, .card-title, .card-swatch, .variants-popup, .card-compare, .card-quickview, .card-wishlist, .list-product-tabs'),
                clientX,
                clientY,
                scrollerBox,
                cursorSide = null,
                cursorInsideSwiper = false;

            document.addEventListener('mousemove', (event) => {
                clientX = event.clientX;
                clientY = event.clientY;
                docClientX = event.clientX;
                docClientY = event.clientY;
            });

            const render = () => {
                TweenMax.set(cursorWrapper, {
                    x: clientX,
                    y: clientY
                });
                
                requestAnimationFrame(render);
            };

            requestAnimationFrame(render);

            const wrapTween = TweenMax.to([cursorWrapper] , 0.1, {
                scale: 2.5,
                opacity: 1,
                backgroundColor: 'rgba(42,104,118,1)',
                ease: easingEffect,
                paused: true
            });

            const elementTween = TweenMax.to([imageCursor, iconCursor] , 0.1, {
                opacity: 1,
                ease: easingEffect,
                paused: true
            });

            const handleMouseEnter = (event) => {
                wrapTween.play();
                elementTween.play();
                cursorWrapper.classList.add('handleMouseEnter');
                cursorWrapper.classList.remove('handleMouseLeave');
            };

            const handleMouseLeave = (event) => {
                wrapTween.reverse();
                elementTween.reverse();
                cursorWrapper.classList.add('handleMouseLeave');
                cursorWrapper.classList.remove('handleMouseEnter');
            };

            itemTween.forEach(element => {
                element.addEventListener('mouseenter', handleMouseEnter);
                element.addEventListener('mouseleave', handleMouseLeave);
            });

            itemNotTween.forEach(element => {
                element.addEventListener('mouseenter', handleMouseLeave);
                element.addEventListener('mouseleave', handleMouseEnter);
            });
        },

        productCustomInformation() {
            const $customInfo = $('[data-custom-information]');
            const $thisPopup = $('#scoder-product-custom-information');
            
            $customInfo.on('click', (event) => {
                const $this = $(event.currentTarget);
                const title = $this.find('.title')[0].innerText;
                const thisContent = $this.find('.product-customInformation__popup').html();

                if (thisContent === "" || thisContent == null) return;
                $thisPopup.addClass('is-show');
                $thisPopup.find('.scoder-popup-title').text(title);
                $thisPopup.find('.scoder-popup-content').html(thisContent);
                $body.addClass('is-custom-information');
            });

            $doc.on('click', '[data-close-custom-information]', () => {
                $body.removeClass('is-custom-information');
                $thisPopup.removeClass('is-show');
            });

            $doc.on('click', (event) => {
                if ($body.hasClass('is-custom-information')) {
                    if (($(event.target).closest('#scoder-product-custom-information').length === 0) && ($(event.target).closest('[data-custom-information]').length === 0)) {
                        $body.removeClass('is-custom-information');
                    }
                }
            });
        },

        initLazyloadObserver(loadingImages, productGrid) {
            const setLazyLoaded = (target) => {
                const card = target.closest('.card')
                card.classList.add('ajax-loaded')
            }

            this.lazyloadedObserver = new MutationObserver((mutationList, observer) => {
                mutationList.forEach((mutation) => {
                    if (mutation.type == 'attributes') {
                        if (!mutation.target.classList.contains('lazyloaded')) return 
                        setLazyLoaded(mutation.target)
                    }
                })
            }) 
            
            const parentObserver = new MutationObserver((mutationlist) => {
                mutationlist.forEach((mutation) => {
                    if (mutation.type == 'childList') {
                        const addedLoadingImages = [...mutation.addedNodes].map(node => node.querySelector('.media--loading-effect img'))
                        addedLoadingImages.forEach(image => {
                            this.lazyloadedObserver.observe(image, { childList: true, attributes: true })
                        })    
                    }
                })
            }) 

            if (productGrid) parentObserver.observe(productGrid, { subtree: false, childList: true });
            if (loadingImages.length > 0) loadingImages.forEach(image => {
                if (image.classList.contains('lazyloaded')) {
                    setLazyLoaded(image)
                } else {
                    this.lazyloadedObserver.observe(image, { childList: true, attributes: true })
                }
            })
        },

        observeImageLazyloaded(images) {
            images.forEach(image => {
                this.lazyloadedObserver.observe(image, { childList: true, attributes: true })
            })
        },

        iconZoomClickMobile() {
            const iconZoom = $('.productView-iconZoom');
            iconZoom.on('click', (event) => {
                document.querySelector('.productView-image .productView-img-container .media').click();
            });
        },

        calculateTranslateYHeight() {
            const cardActions = document.querySelectorAll('.card .card-action:not(.variants-popup-form)');
            let heighest = 0;
          
            if (!cardActions.length) return;
            cardActions.forEach(cardAction => {
              cardAction.classList.add('temporary-show');
            
              const height = cardAction.clientHeight ;
              if (height > heighest) heighest = height;
  
              cardAction.classList.remove('temporary-show');
            })
            document.body.style.setProperty('--translate-y-height', heighest * -1 + 'px');
        },

        checkScrollLayoutForRecenlyViewed() {
            const RecentlyViewedSection = document.getElementById('recently-viewed-products-list-2');

            if (RecentlyViewedSection && RecentlyViewedSection.classList.contains('products-flex')) {
                const RecentlyViewedObserver = new MutationObserver((mutationList, observer) => {
                    const mutationRecentlyViewed = mutationList[0];

                    if (mutationRecentlyViewed.type == 'attributes' 
                        && mutationRecentlyViewed.target.classList.contains('recently-viewed-loaded')) {
                        const enableHover = $(mutationRecentlyViewed.target.closest('[data-recently-viewed-block]')).find('[data-enable-hover]').attr('data-enable-hover')
                        if (enableHover === 'true' && (RecentlyViewedSection.clientWidth < RecentlyViewedSection.scrollWidth)) {
                            scoder.productBlockScroller($(mutationRecentlyViewed.target.closest('[data-recently-viewed-block]')));
                        }

                        observer.disconnect();
                    }
                })

                RecentlyViewedObserver.observe(RecentlyViewedSection, { attributes: true });
            }
        }
      
    }
})(jQuery);