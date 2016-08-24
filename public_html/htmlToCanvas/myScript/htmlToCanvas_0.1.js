/* global html2canvas */

function PDFFabric (args) {
    
    var RETURN_BASE64 = "base64";
    var RETURN_SAVE = "save";
    var pdf;
    
    this.pageWidth = 710;
    this.pageHeight = 950;
    this.target = $();
    this.pdfName = "pdf_file.pdf";
    this.returnType = RETURN_SAVE;
    
    this.onSuccess = function () {};
    
    $.extend(this, args);
    
    this.createCanvases = function(pages, whenOver, imgs) {
        imgs = typeof(imgs) === "undefined" ? [] : imgs;

        if (pages.length === 0) {
            whenOver(imgs, this);
            return;
        }

        var $div = $("<div>", {
            css: {
                "background-color": "white",
                "width": this.pageWidth
            }
        }).appendTo("body").append(pages[0]);

        html2canvas($div).then(function (canvas) {
            imgs.push(canvas);
            pages = pages.slice(1);
            createCanvases(pages, whenOver, imgs);
            $div.remove();
        });
    };
    
    var getReturn = function () {
        switch(this.returnType) {
            
            case RETURN_BASE64:
                this.pdf.save(this.pdfName);
            break;
                
            case RETURN_SAVE:
                return this.pdf.output("dataurlstring");
            
        }
    };
    
    this.createPDF = function() {
        var elementsToPrint = $.makeArray(this.target.children().clone());
        var pages = [];
        var auxDiv = $("<div>").appendTo($("body"));
        elementsToPrint.forEach(function (value, index) {
            var element = $(value);
            auxDiv.append(element);
            var auxDivH = auxDiv.height();
            if (auxDivH > this.pageHeight) {
                pages.push(auxDiv.children().not(element));
                auxDiv.empty();
                auxDiv.append(element);
            }

            if (elementsToPrint.length - 1 === index && auxDiv.length > 0) {
                pages.push(auxDiv.children());
            }
        });
        auxDiv.remove();

        this.createCanvases(pages, function (imgs, pdfFabric) {
            pdfFabric.pdf = new jsPDF("p", "pt", "a4");
            imgs.forEach(function (value, index) {
                var imgData = value.toDataURL("image/jpeg", 1);
                pdfFabric.pdf.addImage(imgData, "jpeg", 30, 30);
                if (index !== imgs.length - 1) {
                    pdfFabric.pdf.addPage();
                }
            });
            
            pdfFabric.onSuccess(pdfFabric.getReturn());
        }, []);
    };
    
}


