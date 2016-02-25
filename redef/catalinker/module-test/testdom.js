/*global document*/
import jsdom from 'jsdom';

global.document = jsdom.jsdom('<html><body><div id="container"/></body></html>');
global.window = document.defaultView;
global.navigator = {
  userAgent: 'node.js'
};
