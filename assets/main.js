console.log("loading main.js");

document.addEventListener("DOMContentLoaded", function() {
    console.log("entered event listener");
    
    var lastElementClicked;
    var PrevLink = document.querySelector('a.prev');
    var NextLink = document.querySelector('a.next');
    var headerHeight, navHeaderHeight;
    
    var largeHeader = $("#headerIntroText");
    var navHeader = $("#navHeader");
    
    Barba.Pjax.init();
    Barba.Prefetch.init();
    
    Barba.Dispatcher.on('linkClicked', function(el) {
        lastElementClicked = el;
    });
    
    var MovePage = Barba.BaseTransition.extend({
        start: function() {
            console.log("movepage start");
            
        this.originalThumb = lastElementClicked;
    
        Promise
            .all([this.newContainerLoading, this.scrollTop()])
            .then(this.movePages.bind(this));
        },
    
        scrollTop: function() {
        console.log("scrolltop start");
        var deferred = Barba.Utils.deferred();
        var obj = { y: window.pageYOffset };
    
        TweenLite.to(obj, 0, {
            y: 0,
            onUpdate: function() {
            if (obj.y === 0) {
                deferred.resolve();
            }
            window.scroll(0, obj.y);
            },
            onComplete: function() {
                deferred.resolve();
            }
        });
    
        return deferred.promise;
        },
    
        movePages: function() {
        console.log("movepages start");
        var _this = this;
        var goingForward = true;
        navHeaderHeight = $(navHeader).height();
        headerHeight = $(largeHeader).height();
        totalHeight = navHeaderHeight;

        if (this.getNewPageFile() === this.oldContainer.dataset.prev) {
            goingForward = false;
        }

        if (window.location.href == "/") {

            console.log("showing header: " + navHeader + ", " +  largeHeader);
            
            totalHeight = navHeaderHeight + headerHeight;
            //show big text header 
            TweenLite.set(largeHeader, {
                visibility: 'visible',
                position: `relative`,
                opacity: 0,
                onComplete: function() {
            }});
            TweenLite.to(largeHeader, 0.5, {
                position: `relative`,
                opacity: 100,
                // y: navHeaderHeight,
                onComplete: function() {
                    console.log("show complete large header to position");
                    TweenLite.set(largeHeader, { clearProps: 'all' });
                }
            });
        }
        else{
            totalHeight = navHeaderHeight;
            console.log("hiding header: " + navHeader + ", " +  largeHeader);
            //hide big text header 
            TweenLite.set(largeHeader, {
                visibility: 'visible',
                position: `absolute`
                // top: _this.y
            });
            TweenLite.to(largeHeader, 0.5, {
                position: `absolute`,
                // height: 0,
                opacity: 0,
                // top: (_this.y - 15),
                onComplete: function() {
                    console.log("hiding large header to position");
                    TweenLite.set(largeHeader, {  });
                // _this.done();
            }});

            //switch between screens
            TweenLite.set(this.newContainer, {
                visibility: 'visible',
                position: `absolute`,
                y: goingForward ? (totalHeight + 32) : -100,
                opacity: 0,
                left: 0,
                top: 0
                // z: 9998
            });
        
            TweenLite.to(this.newContainer, 0.5, {
                delay: 0.13,
                y: totalHeight,
                top: 0,
                opacity: 100,
                onComplete: function() {
                TweenLite.set(_this.newContainer, { clearProps: 'all' });
                _this.done();
            }});
    
            TweenLite.to(this.oldContainer, 0.3, { 
                y: goingForward ? -32 : 100,
                opacity: 0
                // z: 2
            });
        }
    
        },
    
        getNewPageFile: function() {
        console.log("newpagefile start");
        return Barba.HistoryManager.currentStatus().url.split('/').pop();
        }
    });
    
    Barba.Pjax.getTransition = function() {
        return MovePage;
    };
});