/*!
  * jQuery XForm plugin v1.0
  * Copyright 2008-2021 Weberest
  * Licensed under MIT
  */

const xformOptions = {
    classHide: 'collapse',
    classErrorMessage: '',
    classSuccessMessage: '',
    classValidInput: '',
    classInvalidInput: '',
    onPost: false,
    onSuccess: false,
    onInvalid: false,
    onComplete: false,
    onError: false
};

export default xformOptions;

$.fn.extend({
    xform: function (options) {
        return this.each(function () {
            let xform = this;
            let $xform = $(this);

            this.options = $.extend({}, xformOptions, options);
            this.errors = {};
            this.report = {};

            this.showOverlay = function () {
                let id = $xform.attr('xform-overlay');
                if (typeof id === 'string') {
                    $('#' + id).removeClass(xform.options.classHide);
                }
            };

            this.hideOverlay = function () {
                let id = $xform.attr('xform-overlay');
                if (typeof id === 'string') {
                    $('#' + id).addClass(xform.options.classHide);
                }
            };

            this.renderErrors = function (selector) {
                let $ul = $(selector);
                if ($ul.length === 0) {
                    return false;
                }

                $ul.html('');

                if (xform.report.hasOwnProperty('fields')) {
                    for (let field in xform.report.fields) {
                        if (xform.report.fields.hasOwnProperty(field) && xform.report.fields[field].status === 'invalid') {
                            $ul.append('<li class="' + xform.options.classErrorMessage + '">' + xform.report.fields[field].message + '</li>');
                        }
                    }
                }

                return true;
            };

            this.showErrors = function () {
                let id = $xform.attr('xform-errors');
                if ((typeof id === 'string') && (xform.renderErrors('#' + id + ' ul[xform=list]') === true)) {
                    $('#' + id).removeClass(xform.options.classHide);
                }
            };

            this.hideErrors = function() {
                let id = $xform.attr('xform-errors');
                if (typeof id === 'string') {
                    $('#' + id).addClass(xform.options.classHide);
                }
            };

            this.renderSuccess = function (selector) {
                let $ul = $(selector);
                if ($ul.length === 0) {
                    return false;
                }

                $ul.html('<li class="' + xform.options.classSuccessMessage + '">' + xform.report.message + '</li>');

                return true;
            };

            this.showSuccess = function () {
                let id = $xform.attr('xform-success');
                if ((typeof id === 'string') && (xform.renderSuccess('#' + id + ' ul[xform=list]') === true)) {
                    $('#' + id).removeClass(xform.options.classHide);
                }
                if ($xform.attr('xform-remove-after-success') === 'true') {
                    xform.remove();
                }
                if ($xform.attr('xform-reset-after-success') === 'true') {
                    xform.reset();
                }
            };

            this.hideSuccess = function () {
                let id = $xform.attr('xform-success');
                if (typeof id === 'string') {
                    $('#' + id).addClass(xform.options.classHide);
                }
            };

            $xform.submit(function (event) {
                event.preventDefault();

                xform.showOverlay();

                let $inputs = $xform.find(':input');
                $inputs.removeClass(xform.options.classInvalidInput);
                $inputs.removeClass(xform.options.classValidInput);

                let $submit = $xform.find(':submit');
                $submit.addClass('disabled').attr('disabled', true);

                xform.report = {};

                if (typeof xform.options.onPost === 'function') {
                    xform.options.onPost(xform);
                }

                $.ajax({
                    url: $xform.attr('action'),
                    method: $xform.attr('method'),
                    data: $xform.serialize(),
                    success: function (data) {
                        xform.report = data;

                        if (xform.report.hasOwnProperty('fields')) {
                            for (const field in xform.report.fields) {
                                if (xform.report.fields.hasOwnProperty(field)) {
                                    if (xform.report.fields[field].status === 'invalid') {
                                        $xform.find(':input[name=' + field + ']').addClass(xform.options.classInvalidInput);
                                    } else if (xform.report.fields[field].status === 'valid') {
                                        $xform.find(':input[name=' + field + ']').addClass(xform.options.classValidInput);
                                    }
                                }
                            }
                        }

                        if (data.status === 'success') {
                            if (typeof xform.options.onSuccess === 'function') {
                                xform.options.onSuccess(xform);
                            }

                            if (typeof data.redirect === "string") {
                                window.location = data.redirect;
                            }

                            xform.hideErrors();
                            xform.showSuccess();
                        } else if (data.status === 'invalid') {
                            if (typeof xform.options.onInvalid === 'function') {
                                xform.options.onInvalid(xform);
                            }

                            xform.hideSuccess();
                            xform.showErrors();
                        }
                    },
                    error: function (jqXHR) {
                        if (typeof xform.options.onError === 'function') {
                            xform.report = {
                                status:  'error',
                                message: 'HTTP status ' + jqXHR.status,
                                fields:  {}
                            };
                            xform.options.onError(xform);
                        }
                    },
                    complete: function () {
                        if (typeof xform.options.onComplete === 'function') {
                            xform.options.onComplete(xform);
                        }

                        $submit.removeClass('disabled').removeAttr('disabled');
                        xform.hideOverlay();
                    }
                });
            });
        })
    }
});
