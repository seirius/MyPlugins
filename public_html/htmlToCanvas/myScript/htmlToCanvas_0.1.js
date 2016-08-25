/* global html2canvas */

function PDFFabric (args) {
    
    this.pageWidth = 710;
    this.pageHeight = 950;
    this.target = $();
    this.pdfName = "pdf_file.pdf";
    this.returnType = this.private.RETURN_SAVE;
    
    this.onSuccess = function () {};
    
    $.extend(this, args);
    
}

PDFFabric.prototype = {
    
    private: {
        RETURN_BASE64: "base64",
        RETURN_SAVE: "save",
        pdf: {}
    },
    
    getReturn: function () {
        var fabric = this;
        switch(fabric.returnType) {
            
            case fabric.private.RETURN_SAVE:
                fabric.private.pdf.save(fabric.pdfName);
            break;
                
            case fabric.private.RETURN_BASE64:
                return fabric.private.pdf.output("dataurlstring");
            
        }
    },
    
    createCanvases: function (pages, whenOver, imgs) {
        var fabric = this;
        imgs = typeof(imgs) === "undefined" ? [] : imgs;

        if (pages.length === 0) {
            whenOver(imgs);
            return;
        }

        var $div = $("<div>", {
            css: {
                "background-color": "white",
                "width": fabric.pageWidth
            }
        }).appendTo("body").append(pages[0]);

        html2canvas($div).then(function (canvas) {
            imgs.push(canvas);
            pages = pages.slice(1);
            fabric.createCanvases(pages, whenOver, imgs);
            $div.remove();
        });
    },

    createPDF: function () {
        var fabric = this;
        var elementsToPrint = $.makeArray(fabric.target.children().clone());
        var pages = [];
        var auxDiv = $("<div>").appendTo($("body"));
        elementsToPrint.forEach(function (value, index) {
            var element = $(value);
            auxDiv.append(element);
            var auxDivH = auxDiv.height();
            if (auxDivH > fabric.pageHeight) {
                pages.push(auxDiv.children().not(element));
                auxDiv.empty();
                auxDiv.append(element);
            }

            if (elementsToPrint.length - 1 === index && auxDiv.length > 0) {
                pages.push(auxDiv.children());
            }
        });
        auxDiv.remove();

        fabric.createCanvases(pages, function (imgs) {
            fabric.private.pdf = new jsPDF("p", "pt", "a4");
            imgs.forEach(function (value, index) {
                var imgData = value.toDataURL("image/jpeg", 1);
                fabric.private.pdf.addImage(imgData, "jpeg", 30, 30);
                if (index !== imgs.length - 1) {
                    fabric.private.pdf.addPage();
                }
            });
            
            fabric.onSuccess(fabric.getReturn());
        }, []);
    }

};