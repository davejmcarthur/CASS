var RelationshipSearchScreen = function(lastViewed, query, ownership) {
    CassManagerScreen.call(this);
    this.lastViewed = lastViewed;
    this.query = query;
    this.ownership = ownership;
};
RelationshipSearchScreen = stjs.extend(RelationshipSearchScreen, CassManagerScreen, [], function(constructor, prototype) {
    constructor.displayName = "relationSearch";
    prototype.lastViewed = null;
    prototype.query = null;
    prototype.ownership = null;
    prototype.display = function(containerId, callback) {
        console.error("Not Implemented Yet!");
    };
    prototype.getDisplayName = function() {
        return RelationshipSearchScreen.displayName;
    };
}, {lastViewed: "Object", reloadLoginCallback: "Callback0", reloadShowLoginCallback: "Callback0"}, {});
(function() {
    ScreenManager.addStartupScreenCallback(function() {
        if (window.document.location.hash.startsWith("#" + RelationshipSearchScreen.displayName)) {
            var hashSplit = (window.document.location.hash.split("?"));
            if (hashSplit.length > 1) {
                var query = null;
                var ownership = null;
                var param = hashSplit[1];
                var paramSplit = (param.split("&"));
                for (var i = 0; i < paramSplit.length; i++) {
                    var paramPiece = paramSplit[i];
                    if (paramPiece.startsWith("query")) 
                        query = paramSplit[i].split("=")[1];
                     else if (paramPiece.startsWith("ownership")) 
                        ownership = paramSplit[i].split("=")[1];
                }
                if (query != null || ownership != null) {
                    ScreenManager.startupScreen = new RelationshipSearchScreen(null, query, ownership);
                    CassManagerScreen.showLoginModalIfReload();
                    return;
                }
            }
            ScreenManager.startupScreen = new RelationshipSearchScreen(null, null, null);
            CassManagerScreen.showLoginModalIfReload();
        }
    });
})();
