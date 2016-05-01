# -*- coding: utf-8 -*-

import strategy
from huatai import command


class Simple(strategy.Strategy):
    def run(self, logger, strategy_args):
        logger_prefix = strategy_args['logger_prefix']
        stock_code = strategy_args['stock_code']
        stock_amount = strategy_args['stock_amount']
        threshold = strategy_args['threshold']
        user = strategy_args['user_info']

        err, data = command.get_withdraw_list(user)
        if err is not None:
            logger.error('%s get withdraw list failed: %s' %(logger_prefix, data))
            return

        item = None
        price = 0.0
        for i in range(0, len(data)):
            if 'stock_code' in data[i] and data[i]['bs_name'] == u'买入' and data[i]['stock_code'] == stock_code and data[i]['entrust_status'] == '2':
                item = data[i]
                price = float(item['entrust_price'])
                logger.debug('%s get last buy entrust: %s; price = %.3f; amount = %d; entrust_status = %s' \
                    %(logger_prefix, item['entrust_no'], price, stock_amount, str(item['entrust_status'])))
                break

        err, data = command.query_stock(stock_code)
        if err is not None:
            logger.error('%s query stock info failed: %s' %(logger_prefix, data))
            return

        logger.debug('%s buy1: %.3f %.3f; sell1: %.3f %.3f' \
                %(logger_prefix, data['bjw1'], data['bsl1'], data['sjw1'], data['ssl1']))
        logger.debug('%s my entrust: %.3f' %(logger_prefix, price))

        bjw1 = data['bjw1']
        market = data['market']
        if item is not None and bjw1 == price and data['bsl1'] <= stock_amount / 100:
            bjw1 = data['bjw2']
            logger.debug('%s buy1 = %.3f' %(logger_prefix, bjw1))

        diff = data['sjw1'] - bjw1
        if diff < threshold:
            info = ' < ' + str(threshold)
        else:
            info = ' >= ' + str(threshold)
        logger.info('%s sell1 - buy1 = %.3f%s' %(logger_prefix, diff, info))
        if diff < threshold:
            if item is not None:
                logger.warn('%s cancel last entrust: %s' %(logger_prefix, item['entrust_no']))
                err, data = command.cancel_entrust(user, item['entrust_no'])
                if err is not None:
                    logger.error('%s cancel entrust failed' %(logger_prefix, data))
                else:
                    logger.info('%s cancel entrust success: %s' %(logger_prefix, item['entrust_no']))
            else:
                logger.warn('%s no entrust. do nothing' %(logger_prefix))
            return

        new_price = bjw1 + 0.001
        if item is None:
            logger.warn('%s no entrust. make a new entrust' %(logger_prefix))
            err, d = command.buy(user, market, stock_code, stock_amount, new_price)
            if err is not None:
                logger.error('%s make new entrust failed: %s' %(logger_prefix, d))
            else:
                logger.info('%s make new entrust success' %(logger_prefix))
            return

        if float(item['entrust_price']) != new_price:
            logger.warn('%s last entrust price != buy1 + 0.001, cancel and redo the entrust' %(logger_prefix))
            err, d = command.cancel_entrust(user, item['entrust_no'])
            if err is not None:
                logger.error('%s cancel entrust: %s failed: %s' %(logger_prefix, item['entrust_no'], d))
            else:
                logger.info('%s cancel entrust success: %s' %(logger_prefix, item['entrust_no']))
            logger.warn('%s make a new entrust with %.3f' %(logger_prefix, new_price))
            err, d = command.buy(user, market, stock_code, stock_amount, new_price)
            if err is not None:
                logger.error('%s make new entrust failed: %s' %(logger_prefix, d))
            else:
                logger.info('%s make new entrust success' %(logger_prefix))
        else:
            logger.warn('%s last entrust price == buy1 + 0.001. do nothing' %(logger_prefix))
