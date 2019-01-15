console.log("loading main.js");

document.addEventListener("DOMContentLoaded", function() {
    console.log("entered event listener");
    
    var lastElementClicked;
    var PrevLink = document.querySelector('a.prev');
    var NextLink = document.querySelector('a.next');
    var headerHeight = $("#navHeader").height();
    
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
    
        if (this.getNewPageFile() === this.oldContainer.dataset.prev) {
            goingForward = false;
        }
    
        TweenLite.set(this.newContainer, {
            visibility: 'visible',
            position: `fixed`,
            xPercent: goingForward ? 5 : -100,
            opacity: 0,
            left: 0,
            top: headerHeight
            // z: 9998
        });
    
        TweenLite.to(this.oldContainer, 0.3, { 
            xPercent: goingForward ? -5 : 100,
            opacity: 0
            // z: 2
        });
        TweenLite.to(this.newContainer, 0.5, {
            delay: 0.3,
            xPercent: 0,
            opacity: 100,
            onComplete: function() {
            TweenLite.set(_this.newContainer, { clearProps: 'all' });
            _this.done();
        }});
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