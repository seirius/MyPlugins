/* global html2canvas */

//------------------------------------------------------------------------------
//PDFFabric
//------------------------------------------------------------------------------

function PDFFabric (args) {
    
    this.pageWidth = 710;
    this.pageHeight = 950;
    this.target = $();
    this.pdfName = "pdf_file.pdf";
    this.returnType = this.static.RETURN_SAVE;
    
    this.private = {
        RETURN_BASE64: "base64",
        RETURN_SAVE: "save",
        pdf: {},
        elementsO: [],
        elementsN: [],
        pages: [],
        temporalDiv: $(),
        childPaginationCounter: 0
    },
    
    this.onSuccess = function () {};
    
    $.extend(this, args);
    
    this.private.elementsO = $.makeArray(this.target.clone().children());
    
}

PDFFabric.prototype = {
    
    static: {
        RETURN_BASE64: "base64",
        RETURN_SAVE: "save",
        ATTR_NAME_PAG: "data-child-element-pagination"
    },
    
    getReturn: function () {
        var fabric = this;
        switch(fabric.returnType) {
            
            case fabric.static.RETURN_SAVE:
                fabric.private.pdf.save(fabric.pdfName);
            break;
                
            case fabric.static.RETURN_BASE64:
                return fabric.private.pdf.output("dataurlstring");
            
        }
    },
    
    createCanvases: function (pages, whenOver, imgs) {
        var fabric = this;
        imgs = $.type(imgs) === "undefined" ? [] : imgs;

        if (pages.length === 0) {
            whenOver(imgs);
            return;
        }

        var $div = $("<div>").appendTo("body");
        var $div2 = $("<div>",{
            css: {
                "background-color": "white",
                "width": fabric.pageWidth
            }
        }).appendTo($div).append(pages[0]);

        html2canvas($div2).then(function (canvas) {
            imgs.push(canvas);
            pages = pages.slice(1);
            fabric.createCanvases(pages, whenOver, imgs);
            $div.remove();
        });
        
        $div.css({
            "opacity": 0,
            position: "absolute",
            top: 0,
            left: 0,
            "z-index": -1
        });
    },

    createPDF: function () {
        var fabric = this;
        var temporalDiv = fabric.private.temporalDiv = $("<div>").appendTo($("body"));
        var element, divHeight, elementHeight;
        do {
            element = fabric.getFirstElement();
            temporalDiv.append(element);
            elementHeight = element.height();
            
            if (elementHeight > fabric.pageHeight) {
                
                if (element.is("table")) {
                    fabric.addPageWithElement(element);
                } else {
                    fabric.childsPagination(element);
                }
                
            } else {
                divHeight = temporalDiv.height();
                
                if (divHeight > fabric.pageHeight) {
                    fabric.addPageWithoutElement(element);
                } 
                
                if (fabric.getElementsOLength() === 0 && !fabric.isTemporalDivEmpty()) {
                    fabric.addPage();
                }
                
            }
        } while (fabric.getElementsOLength() > 0);
        
        temporalDiv.remove();
        
        fabric.createCanvases(fabric.private.pages, function (imgs) {
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
    },
    
    childsPagination: function (element) {
        var fabric = this;
        var temporalDiv = fabric.private.temporalDiv;
        var paginationCount = fabric.private.childPaginationCounter;
        var attrName = fabric.static.ATTR_NAME_PAG;
        fabric.private.childPaginationCounter++;
        
        element.remove();
        var elements = $.makeArray(element.children());
        
        if (elements.length === 0) {
            fabric.addPageWithElement(element);
            return;
        }
        
        element.empty();
        var result, elementChild;
        
        do {
            result = fabric.getFirstElementCustom(elements);
            elementChild = result.element;
            elementChild.attr(attrName, paginationCount);
            elements = result.elements;
            
            temporalDiv.append(elementChild);
            var elementChildHeight = elementChild.height();
            
            if (elementChildHeight > fabric.pageHeight) {
                
                if (elementChild.is("table")) {
                    fabric.addPageWithElement(element.clone().append(elementChild));
                } else {
                    fabric.childsPagination(elementChild);
                }
                
            } else {
                var divHeight = temporalDiv.height();

                if (divHeight > fabric.pageHeight) {
                    var auxContainerPagination = temporalDiv.children("[" + attrName + "=" + paginationCount + "]");
                    var auxContainerBefore = temporalDiv.children().not("[" + attrName + "=" + paginationCount + "]");
                    temporalDiv.empty();
                    var elementClone = element.clone().append(auxContainerPagination);
                    elementClone.css("height", "auto");
                    temporalDiv.append(auxContainerBefore);
                    temporalDiv.append(elementClone);
                    fabric.addPageWithoutElement(elementChild);
                } 
                
                if (elements.length === 0 && !fabric.isTemporalDivEmpty()) {
                    var auxContainer = temporalDiv.children();
                    temporalDiv.empty();
                    var elementClone = element.clone().append(auxContainer);
                    elementClone.css("height", "auto");
                    temporalDiv.append(elementClone);
                    fabric.addPage();
                }
            }
            
        } while(elements.length > 0);
        
    },
    
    addPage: function () {
        var fabric = this;
        var pages = fabric.private.pages;
        var temporalDiv = fabric.private.temporalDiv;
        pages.push(temporalDiv.children());
        temporalDiv.empty();
    },
    
    addPageWithoutElement: function (element) {
        var fabric = this;
        var pages = fabric.private.pages;
        var temporalDiv = fabric.private.temporalDiv;
        pages.push(temporalDiv.children().not(element));
        temporalDiv.empty();
        temporalDiv.append(element);
    },
    
    addPageWithElement: function (element) {
        var fabric = this;
        var temporalDiv = fabric.private.temporalDiv;
        if (!fabric.isTemporalDivEmpty()) {
            fabric.addPageWithoutElement(element);
            fabric.addPage();
        } else {
            temporalDiv.append(element);
            fabric.addPage();
        }
    },
    
    getFirstElement: function () {
        var fabric = this;
        var elementsO = fabric.private.elementsO;
        
        if (elementsO.length === 0) {
            return;
        }
        
        var element = elementsO[0];
        elementsO = elementsO.slice(1);
        fabric.private.elementsO = elementsO;
        return $(element);
    },
    
    getFirstElementCustom: function (elements) {
        
        if (elements.length === 0) {
            return;
        }
        
        var element = elements[0];
        elements = elements.slice(1);
        return {
            element: $(element),
            elements: elements
        };
    },
    
    getElementsOLength: function () {
        var fabric = this;
        var elementsO = fabric.private.elementsO;
        return elementsO.length;
    },
    
    isTemporalDivEmpty: function () {
        var fabric = this;
        var temporalDiv = fabric.private.temporalDiv;
        return temporalDiv.length === 0;
    }

};


