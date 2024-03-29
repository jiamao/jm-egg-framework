'use strict';

const path = require('path');
const egg = require('egg');
const EGG_PATH = Symbol.for('egg#eggPath');

class JMFrameworkAgent extends egg.Agent {
    get [EGG_PATH]() {
        return path.dirname(__dirname);
    }
}

module.exports = JMFrameworkAgent;