import telebot

import config
import database

bot = telebot.TeleBot(config.telegram_bot_token, parse_mode=None)

Database = database.Database()

@bot.message_handler(commands=['start'])
def send_welcome(message):
    print(message.chat.id)
    bot.send_message(message.chat.id, "Hi!\nIch bin der BeeLogger Bot, der dir automatisch Informationen zum Bienenschwarm schickt!\n\n"
                                      "Starte mit:\n"
                                      "/aboniere_warnungen um Warnungen zum Bienenvolk zu erhalten.\n"
                                      "/deaboniere_warnungen um Warnungen abzubestellen.")

@bot.message_handler(commands=['aboniere_warnungen'])
def sub_warnings(message):
    Database.set_telegram_subscription(message.chat.id, "warning", True)
    bot.reply_to(message, "Du erhälst nun Warnungen zum Bienenvolk!")
@bot.message_handler(commands=['deaboniere_warnungen'])
def unsub_warnings(message):
    Database.set_telegram_subscription(message.chat.id, "warning", False)
    bot.reply_to(message, "Du erhälst nun keine Warnungen mehr!")

@bot.message_handler(commands=['aboniere_admin'])
def sub_admin(message):
    Database.set_telegram_subscription(message.chat.id, "admin", True)
    bot.reply_to(message, "Du erhälst nun Admin Nachrichten der Software!")
@bot.message_handler(commands=['deaboniere_admin'])
def unsub_admin(message):
    Database.set_telegram_subscription(message.chat.id, "admin", False)
    bot.reply_to(message, "Du erhälst nun keine Admin Nachrichten mehr!")

@bot.message_handler(commands=['aboniere_data'])
def sub_data(message):
    Database.set_telegram_subscription(message.chat.id, "data", True)
    bot.reply_to(message, "Du erhälst nun Datensätze via Telegram!")
@bot.message_handler(commands=['deaboniere_data'])
def unsub_data(message):
    Database.set_telegram_subscription(message.chat.id, "data", False)
    bot.reply_to(message, "Du erhälst nun keine Datensätze mehr via Telegram./st")


if __name__ == "__main__":
    bot.infinity_polling()
