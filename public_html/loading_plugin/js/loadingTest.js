$(document).ready(function () {
    var defaultLoading = ""
        + " <div class='wrap'>"
        + "     <div class='box1'>"
        + "     </div>"
        + "     <div class='box2'>"
        + "     </div>"
        + "     <div class='box3'>"
        + "     </div>"
        + " </div>"
        +"";

    $("#btnLoad").click(function () {
        $("#div").loadingState({
            html: defaultLoading
        });
    });
    
    $("#btnLoadOnBody").click(function () {
        $("body").loadingState({
            html: defaultLoading
        });
        
        setTimeout(function () {
            $("body").loadingState("destroy");
        }, 5000);
    });
    
    $("#btnUnload").click(function () {
        $("#div").loadingState("destroy");
    });
});

