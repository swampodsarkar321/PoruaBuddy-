# -*- coding: utf-8 -*-
import os, time, json, random, threading, requests
from http.server import BaseHTTPRequestHandler, HTTPServer
BOT = os.environ.get("BOT_TOKEN", "")
OR_KEY = os.environ.get("OPENROUTER_KEY", "")
ADMIN_DEFAULT = "8273686230"


def _health_loop():
    port = int(os.environ.get("PORT", "10000"))

    class H(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path in ("/health", "/"):
                body = b'{"ok":true}'
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            else:
                self.send_response(404)
                self.end_headers()

        def log_message(self, *a):
            pass

    try:
        HTTPServer(("0.0.0.0", port), H).serve_forever()
    except Exception as e:
        print("HEALTH_ERR", e, flush=True)


threading.Thread(target=_health_loop, daemon=True).start()
API = f"https://api.telegram.org/bot{BOT}"

MODELS_FALLBACK = [
    "google/gemma-4-26b-a4b-it:free",
    "google/gemma-4-31b-it:free",
    "dots-studio/dots-3-note-preview:free",
    "nvidia/nemotron-3.5-lightning:free",
    "poolside/laguna-s-2.1:free",
    "apodex/apodex-1.1-mini:free",
]
MODEL_PRO = "google/gemini-flash-1.5"
USERS = {}
PDFS = {}
off = None
COOLDOWN_FREE = 20
COOLDOWN_PRO = 5

SYS = "তুমি পড়ুয়াবাডি, বাংলাদেশের ছাত্রদের বাংলা শিক্ষক। সবসময় শুদ্ধ ও খাঁটি বাংলায় উত্তর দেবে — বানান নির্ভুল হতে হবে। কোনো ইংরেজি বাক্য লিখবে না, কোনো চিন্তাভাবনা দেখাবে না, শুধু চূড়ান্ত উত্তর দেবে। বাংলাদেশের জাতীয় শিক্ষাক্রম (NCTB), বোর্ড বই, ভর্তি পরীক্ষা ও বিসিএস সিলেবাস অনুযায়ী পড়াবে। বাইরের দেশের সিলেবাস বা উদাহরণ দেবে না। সহজ ভাষায়, ধাপে ধাপে, সর্বোচ্চ ৮ লাইনে বোঝাবে।"

MENU_KB = {
    "keyboard": [
        [{"text": "📝 Study"}, {"text": "🎯 Quiz"}],
        [{"text": "📚 Notes"}, {"text": "⭐ Premium"}],
        [{"text": "👤 Profile"}, {"text": "👥 Invite Friends"}],
        [{"text": "❓ Help"}],
    ],
    "resize_keyboard": True,
    "input_field_placeholder": "Type your question...",
}

QUIZ = [
    {"q": "বাংলাদেশের জাতীয় ফল কোনটি?", "o": ["আম", "কাঁঠাল", "লিচু", "কলা"], "a": 1},
    {"q": "পানির রাসায়নিক সংকেত কী?", "o": ["CO2", "O2", "H2O", "NaCl"], "a": 2},
    {"q": "৭ + ৮ × ২ = ?", "o": ["৩০", "২৩", "২২", "২০"], "a": 1},
    {"q": "বাংলা নববর্ষ কোন তারিখে?", "o": ["১ বৈশাখ", "১ জানুয়ারি", "২১ ফেব্রুয়ারি", "১৬ ডিসেম্বর"], "a": 0},
    {"q": "মানবদেহে হাড়ের সংখ্যা?", "o": ["২০৬", "২০০", "২১৬", "১৯৬"], "a": 0},
    {"q": "পদ্মা সেতুর দৈর্ঘ্য কত?", "o": ["৫.৫ কিমি", "৬.১৫ কিমি", "৭ কিমি", "৪.৮ কিমি"], "a": 1},
    {"q": "সবচেয়ে বড় গ্রহ?", "o": ["শনি", "পৃথিবী", "বৃহস্পতি", "মঙ্গল"], "a": 2},
    {"q": "বাংলাদেশের মুদ্রার নাম?", "o": ["রুপি", "টাকা", "ডলার", "দিনার"], "a": 1},
    {"q": "ত্রিভুজের কোণগুলোর যোগফল?", "o": ["৯০°", "১৮০°", "৩৬০°", "২৭০°"], "a": 1},
    {"q": "ভাষা শহীদ দিবস কবে?", "o": ["১৬ ডিসেম্বর", "২১ ফেব্রুয়ারি", "২৬ মার্চ", "১৪ এপ্রিল"], "a": 1},
]

BANK_FILE = os.path.join("games", "studybot", "quiz_bank.json")
QUIZ_TARGET = 50


def load_bank():
    try:
        if os.path.exists(BANK_FILE):
            with open(BANK_FILE, encoding="utf-8") as f:
                bank = json.load(f)
            if isinstance(bank, list) and len(bank) >= 10:
                return bank
    except Exception as e:
        print("BANK_LOAD_ERR", e, flush=True)
    return list(QUIZ)


def save_bank(bank):
    try:
        with open(BANK_FILE, "w", encoding="utf-8") as f:
            json.dump(bank[-200:], f, ensure_ascii=False)
    except Exception as e:
        print("BANK_SAVE_ERR", e, flush=True)


QUIZ = load_bank()


def ai_make_quiz(n=10):
    h = {"Authorization": f"Bearer {OR_KEY}", "Content-Type": "application/json",
         "HTTP-Referer": "https://t.me/PoruaBuddyBot", "X-Title": "PoruaBuddy"}
    prompt = (
        f"বাংলাদেশের ১ম-১০ম শ্রেণি, ভর্তি ও BCS সিলেবাস থেকে {n}টা MCQ বানাও। "
        "শুধু JSON array দাও, কোনো বাড়তি লেখা না। ফরম্যাট: "
        '[{"q":"প্রশ্ন","o":["অপশন১","অপশন২","অপশন৩","অপশন৪"],"a":0}] '
        "(a = সঠিক অপশনের index 0-3)।"
    )
    for mdl in MODELS_FALLBACK:
        try:
            r = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=h,
                json={"model": mdl, "messages": [{"role": "user", "content": prompt}],
                      "max_tokens": 2000, "reasoning": {"exclude": True},
                      "provider": {"sort": "throughput"}}, timeout=90).json()
            if "error" in r:
                continue
            txt = (r["choices"][0]["message"].get("content")
                   or r["choices"][0]["message"].get("reasoning") or "")
            s, e = txt.find("["), txt.rfind("]")
            if s < 0 or e < 0:
                continue
            items = json.loads(txt[s:e + 1])
            good = [x for x in items if isinstance(x, dict) and x.get("q")
                    and isinstance(x.get("o"), list) and len(x["o"]) == 4
                    and isinstance(x.get("a"), int) and 0 <= x["a"] <= 3]
            if good:
                return good
        except Exception:
            continue
    return []


def quiz_refill_loop():
    while True:
        try:
            have = len(QUIZ)
            need = QUIZ_TARGET - have
            if need > 0:
                print(f"QUIZ_REFILL need={need}", flush=True)
                batch = min(10, need)
                for _ in range((need + batch - 1) // batch):
                    new = ai_make_quiz(batch)
                    if not new:
                        break
                    seen = {x["q"] for x in QUIZ}
                    QUIZ.extend([x for x in new if x["q"] not in seen])
                    save_bank(QUIZ)
                    print(f"QUIZ_GROWN total={len(QUIZ)}", flush=True)
                    time.sleep(30)
            time.sleep(6 * 3600)
        except Exception as e:
            print("QUIZ_LOOP_ERR", e, flush=True)
            time.sleep(3600)


threading.Thread(target=quiz_refill_loop, daemon=True).start()

REF_BONUS = 5

CLASS_KB = {"inline_keyboard": [
    [{"text": "Class 1", "callback_data": "cls_1"}, {"text": "Class 2", "callback_data": "cls_2"}, {"text": "Class 3", "callback_data": "cls_3"}],
    [{"text": "Class 4", "callback_data": "cls_4"}, {"text": "Class 5", "callback_data": "cls_5"}, {"text": "Class 6", "callback_data": "cls_6"}],
    [{"text": "Class 7", "callback_data": "cls_7"}, {"text": "Class 8", "callback_data": "cls_8"}, {"text": "Class 9", "callback_data": "cls_9"}],
    [{"text": "🔟 Class 10/SSC", "callback_data": "cls_10"}, {"text": "🎓 HSC", "callback_data": "cls_HSC"}],
    [{"text": "🏛️ Admission", "callback_data": "cls_ADM"}, {"text": "💼 BCS/Job", "callback_data": "cls_BCS"}],
]}

SUBJECT_KB = {"inline_keyboard": [
    [{"text": "➗ Math", "callback_data": "sub_math"}, {"text": "🔬 Science", "callback_data": "sub_sci"}],
    [{"text": "📖 Bangla", "callback_data": "sub_ban"}, {"text": "🌍 English", "callback_data": "sub_eng"}],
    [{"text": "🏆 My Rank", "callback_data": "show_rank"}],
]}


def api(m, d):
    return requests.post(f"{API}/{m}", json=d, timeout=20).json()


def send_photo(c, path, caption):
    try:
        with open(path, "rb") as f:
            requests.post(f"{API}/sendPhoto", data={"chat_id": c, "caption": caption, "parse_mode": "HTML"},
                          files={"photo": f}, timeout=30)
        return True
    except Exception:
        return False


ASSETS = os.path.join("games", "studybot", "assets")


def banner():
    for f in ("banner.png", "banner.jpg", "welcome.png"):
        p = os.path.join(ASSETS, f)
        if os.path.exists(p):
            return p
    return os.path.join(ASSETS, "welcome.png")


def ask(q, pro, cls=""):
    h = {
        "Authorization": f"Bearer {OR_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://t.me/PoruaBuddyBot",
        "X-Title": "PoruaBuddy",
    }
    sys = SYS + (f" ছাত্র {cls} লেভেলে পড়ে (বাংলাদেশ), সেই লেভেলের বোর্ড সিলেবাস অনুযায়ী বোঝাও।" if cls else "")
    models = [MODEL_PRO] if pro else list(MODELS_FALLBACK)
    errs = []
    for mdl in models:
        try:
            b = {
                "model": mdl,
                "messages": [
                    {"role": "system", "content": sys},
                    {"role": "user", "content": q},
                ],
                "max_tokens": 1000,
                "reasoning": {"exclude": True},
                "provider": {"sort": "throughput"},
            }
            r = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=h, json=b, timeout=60,
            ).json()
            if "error" in r:
                errs.append(f"{mdl}:{r['error'].get('code')}")
                continue
            msg = r["choices"][0]["message"]
            a = (msg.get("content") or msg.get("reasoning") or "").strip()
            if not a or len(a) < 2:
                errs.append(f"{mdl}:empty")
                continue
            return a[:3500]
        except Exception:
            errs.append(f"{mdl}:ex")
            continue
    print("ALL_FAIL", errs, flush=True)
    return ""


def kb_pro():
    return {"inline_keyboard": [
        [{"text": "💵 Get Premium with bKash (100 TK)", "callback_data": "buy_bkash"}],
    ]}


def greet(name):
    return (
        f"🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦\n"
        f"📚 <b>PoruaBuddy 2.0</b> ✨\n"
        f"🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪\n\n"
        f"Hello <b>{name}</b>! 👋\n"
        f"Your <b>AI study companion</b> is here — ace exams, learn smarter! 🚀\n\n"
        f"🎓 <b>Our Services</b>\n"
        f"├ 📝 <b>Q&A</b> — step-by-step in Bangla\n"
        f"├ 📚 <b>Notes & Suggestions</b> — PDF download\n"
        f"├ 🎯 <b>Quiz</b> — play & earn points\n"
        f"└ ⭐ <b>Premium</b> — unlimited + fast\n\n"
        f"💳 <b>20 FREE credits daily!</b> (1 credit = 1 question)\n"
        f"👥 Invite friends = +5 credits each\n\n"
        f"👇 <i>Tap what you need:</i>"
    )


WELCOME_KB = {"inline_keyboard": [
    [{"text": "📝 I Want to Study", "callback_data": "svc_ask"}],
    [{"text": "📚 View Notes", "callback_data": "svc_notes"}],
    [{"text": "⭐ Premium", "callback_data": "svc_prem"}],
]}


print("STUDY_START", flush=True)
while True:
    try:
        r = api("getUpdates", {"offset": off, "timeout": 20})
        for u in r.get("result", []):
            off = u["update_id"] + 1
            if "callback_query" in u:
                q = u["callback_query"]
                c = q["message"]["chat"]["id"]
                uid = str(q["from"]["id"])
                data = q.get("data", "")
                if data == "buy_bkash":
                    p = USERS.get(uid, {})
                    p["pay_step"] = "await_paid"
                    r = api("sendMessage", {
                        "chat_id": c,
                        "text": "━━━━━━━━━━━━━━━\n💵 <b>Step 1/3: Send Money</b>\n━━━━━━━━━━━━━━━\n📱 <b>01767882562</b> (bKash, Send Money)\n💰 Amount: <b>100 TK</b>\n\nAfter sending, tap below 👇",
                        "parse_mode": "HTML",
                        "reply_markup": {"inline_keyboard": [[{"text": "✅ Money Sent", "callback_data": "paid_done"}]]},
                    })
                    if r.get("result"):
                        p["pay_mid"] = r["result"]["message_id"]
                    USERS[uid] = p
                elif data == "paid_done":
                    p = USERS.get(uid, {})
                    p["pay_step"] = "await_trx"
                    USERS[uid] = p
                    api("editMessageText", {
                        "chat_id": c, "message_id": p.get("pay_mid", q["message"]["message_id"]),
                        "text": "━━━━━━━━━━━━━━━\n🧾 <b>Step 2/3: Give TrxID</b>\n━━━━━━━━━━━━━━━\n📱 01767882562 → 100 TK ✅\n\nCopy the TrxID from your bKash message and send it here.\nExample: <code>TrxID 9HXK2MABCD</code>",
                        "parse_mode": "HTML",
                    })
                elif data == "trx_ok":
                    p = USERS.get(uid, {})
                    trx = p.get("trx", "")
                    p["pay_step"] = ""
                    USERS[uid] = p
                    api("editMessageText", {
                        "chat_id": c, "message_id": p.get("pay_mid", q["message"]["message_id"]),
                        "text": "━━━━━━━━━━━━━━━\n✅ <b>Submitted!</b>\n━━━━━━━━━━━━━━━\n💰 100 TK → 01767882562\n🧾 TrxID: <code>" + trx + "</code>\n\nPremium will start soon after verification. 🙏",
                        "parse_mode": "HTML",
                    })
                    ADMIN = os.environ.get("ADMIN_ID", ADMIN_DEFAULT)
                    if ADMIN:
                        try:
                            api("sendMessage", {"chat_id": int(ADMIN),
                                "text": f"━━━━━━━━━━━━━━━\n💵 <b>New Payment!</b>\n━━━━━━━━━━━━━━━\n👤 {q['from'].get('first_name', '')} (@{USERS.get(uid, {}).get('uname', '-')})\n🆔 <code>{uid}</code>\n🧾 <code>{trx}</code>\n👇 Decide in one tap:",
                                "parse_mode": "HTML",
                                "reply_markup": {"inline_keyboard": [
                                    [{"text": "✅ Approve", "callback_data": f"approve_{uid}"}, {"text": "❌ Reject", "callback_data": f"reject_{uid}"}],
                                ]}})
                        except Exception:
                            pass
                elif data.startswith("approve_"):
                    ADMIN = os.environ.get("ADMIN_ID", ADMIN_DEFAULT)
                    if uid != str(ADMIN):
                        api("answerCallbackQuery", {"callback_query_id": q["id"], "text": "Admin only!"})
                        continue
                    t = data[8:]
                    tp = USERS.get(t, {"free": 0, "day": 0, "pro": 0, "last": 0, "cls": "", "uname": "", "lastq": ""})
                    tp["pro"] = int(time.time()) + 30 * 86400
                    USERS[t] = tp
                    api("answerCallbackQuery", {"callback_query_id": q["id"], "text": "Premium activated!"})
                    api("editMessageText", {"chat_id": c, "message_id": q["message"]["message_id"],
                        "text": f"✅ <b>Approved!</b> 🆔 <code>{t}</code> — premium ON ✅", "parse_mode": "HTML"})
                    try:
                        api("sendMessage", {"chat_id": int(t), "text": "🎉 <b>Your premium is ON!</b> 30 days unlimited 🚀", "parse_mode": "HTML", "reply_markup": MENU_KB})
                    except Exception:
                        pass
                elif data.startswith("reject_"):
                    ADMIN = os.environ.get("ADMIN_ID", ADMIN_DEFAULT)
                    if uid != str(ADMIN):
                        api("answerCallbackQuery", {"callback_query_id": q["id"], "text": "Admin only!"})
                        continue
                    t = data[7:]
                    api("answerCallbackQuery", {"callback_query_id": q["id"], "text": "Rejected"})
                    api("editMessageText", {"chat_id": c, "message_id": q["message"]["message_id"],
                        "text": f"❌ <b>Rejected!</b> 🆔 <code>{t}</code>", "parse_mode": "HTML"})
                    try:
                        api("sendMessage", {"chat_id": int(t), "text": "❌ Payment could not be verified. Send the correct TrxID again. 🙏"})
                    except Exception:
                        pass
                elif data.startswith("quiz_"):
                    p = USERS.get(uid, {})
                    sess = p.get("qsession")
                    if not sess:
                        api("answerCallbackQuery", {"callback_query_id": q["id"], "text": "Tap Quiz for a new round!"})
                        continue
                    try:
                        qi, oi = map(int, data[5:].split("_"))
                    except ValueError:
                        continue
                    qz = QUIZ[qi % len(QUIZ)]
                    mid = q["message"]["message_id"]
                    if oi == qz["a"]:
                        sess["score"] += 1
                        p["pts"] = p.get("pts", 0) + 10
                        verdict = "✅ <b>Correct! +10</b>"
                    else:
                        verdict = f"❌ <b>Wrong!</b> Ans: {qz['o'][qz['a']]}"
                    sess["pos"] += 1
                    USERS[uid] = p
                    if sess["pos"] >= len(sess["qs"]):
                        total = sess["score"]
                        medal = "🥇" if total == 5 else "🥈" if total == 4 else "🥉" if total == 3 else "💪"
                        p.pop("qsession", None)
                        api("editMessageText", {"chat_id": c, "message_id": mid,
                            "text": f"🎯 <b>Quiz Over!</b> {medal}\n{verdict}\n\n🏆 <b>Score: {total}/5</b> | 🏅 Total: <b>{p.get('pts', 0)} pts</b>",
                            "parse_mode": "HTML"})
                        api("sendMessage", {"chat_id": c, "text": "👇 Tap 🎯 <b>Quiz</b> to play again!", "parse_mode": "HTML", "reply_markup": MENU_KB})
                    else:
                        nqi = sess["qs"][sess["pos"]]
                        nq = QUIZ[nqi % len(QUIZ)]
                        kb = {"inline_keyboard": [[{"text": o, "callback_data": f"quiz_{nqi}_{i}"}] for i, o in enumerate(nq["o"])]}
                        api("editMessageText", {"chat_id": c, "message_id": mid,
                            "text": f"{verdict}\n\n━━━━━━━━━━━━━━━\n❓ <b>Q{sess['pos'] + 1}/5:</b> {nq['q']}  (Score: {sess['score']})",
                            "parse_mode": "HTML",
                            "reply_markup": kb})
                elif data.startswith("sub_"):
                    names = {"sub_math": "➗ Math", "sub_sci": "🔬 Science", "sub_ban": "📖 Bangla",
                             "sub_eng": "🌍 English", "sub_isl": "🕌 Islam", "sub_soc": "🌍 Society"}
                    api("answerCallbackQuery", {"callback_query_id": q["id"], "text": f"{names.get(data, 'Subject')} selected!"})
                    api("sendMessage", {"chat_id": c, "text": f"Type your {names.get(data, '')} question 👇 ✍️ (answer in Bangla)", "reply_markup": MENU_KB})
                elif data == "svc_ask":
                    api("answerCallbackQuery", {"callback_query_id": q["id"], "text": "Study section!"})
                    api("sendMessage", {"chat_id": c, "text": "📚 <b>Which subject?</b> 👇", "parse_mode": "HTML", "reply_markup": SUBJECT_KB})
                    api("sendMessage", {"chat_id": c, "text": "✨ <b>Main menu ON!</b> Everything is below 👇", "reply_markup": MENU_KB})
                elif data == "svc_notes":
                    api("answerCallbackQuery", {"callback_query_id": q["id"], "text": "Notes section!"})
                    if not PDFS:
                        api("sendMessage", {"chat_id": c, "text": "📚 <b>Notes & Suggestions</b>\n\nNo notes yet. Coming soon! 📝", "parse_mode": "HTML"})
                    else:
                        kb = {"inline_keyboard": [[{"text": f"📄 {k}", "callback_data": f"getpdf_{i}"}]] for i, k in enumerate(list(PDFS.keys())[:20])}
                        api("sendMessage", {"chat_id": c, "text": "📚 <b>Notes & Suggestions</b>\n👇 Tap to download:", "parse_mode": "HTML", "reply_markup": kb})
                    api("sendMessage", {"chat_id": c, "text": "✨ <b>Main menu ON!</b> 👇", "reply_markup": MENU_KB})
                elif data == "svc_prem":
                    api("answerCallbackQuery", {"callback_query_id": q["id"], "text": "Premium!"})
                    api("sendMessage", {"chat_id": c,
                        "text": "━━━━━━━━━━━━━━━\n⭐ <b>PoruaBuddy Premium</b> ⭐\n━━━━━━━━━━━━━━━\n✅ Unlimited questions ♾️\n✅ Fast answers ⚡\n✅ Matched to your class 🎓\n\n💰 Only <b>100 TK/month</b> (bKash)\n👇 Tap below to get it:",
                        "parse_mode": "HTML", "reply_markup": kb_pro()})
                    api("sendMessage", {"chat_id": c, "text": "✨ <b>Main menu ON!</b> 👇", "reply_markup": MENU_KB})
                elif data.startswith("cls_"):
                    p = USERS.get(uid, {"free": 0, "day": 0, "pro": 0, "last": 0, "cls": ""})
                    names = {"1": "Class 1", "2": "Class 2", "3": "Class 3", "4": "Class 4", "5": "Class 5", "6": "Class 6",
                             "7": "Class 7", "8": "Class 8", "9": "Class 9", "10": "Class 10/SSC", "HSC": "HSC",
                             "ADM": "Admission", "BCS": "BCS/Job"}
                    p["cls"] = names.get(data[4:], data[4:])
                    USERS[uid] = p
                    api("answerCallbackQuery", {"callback_query_id": q["id"], "text": "Saved!"})
                    api("sendMessage", {"chat_id": c, "text": "✅ Class saved! I will explain at your level, in Bangla. 📚\n\n👇 Tap 📝 Study or just type your question:", "parse_mode": "HTML", "reply_markup": MENU_KB})
                elif data == "show_rank":
                    rank = sorted(USERS.items(), key=lambda x: x[1].get("free", 0), reverse=True)
                    pos = next((i + 1 for i, (k, v) in enumerate(rank) if k == uid), 1)
                    api("sendMessage", {"chat_id": c, "text": f"🏆 <b>Your rank #{pos}</b>\n🔥 Ask daily to climb up!", "parse_mode": "HTML"})
                elif data == "adm_users":
                    ADMIN = os.environ.get("ADMIN_ID", ADMIN_DEFAULT)
                    if uid != str(ADMIN):
                        continue
                    items = sorted(USERS.items(), key=lambda x: x[1].get("free", 0), reverse=True)[:15]
                    lines = []
                    for k, v in items:
                        flag = "🚫" if v.get("banned") else ("⭐" if v.get("pro", 0) > time.time() else "🆓")
                        lines.append(f"{flag} @{v.get('uname', '-')} | <code>{k}</code> | Q:{v.get('free', 0)} | R:{v.get('refs', 0)}")
                    api("sendMessage", {"chat_id": c,
                        "text": "👥 <b>Top Users</b> (by questions)\n\n" + ("\n".join(lines) if lines else "Empty") +
                              "\n\nBan: <code>/ban ID</code> | Unban: <code>/unban ID</code>",
                        "parse_mode": "HTML"})
                elif data == "adm_stats":
                    ADMIN = os.environ.get("ADMIN_ID", ADMIN_DEFAULT)
                    if uid != str(ADMIN):
                        continue
                    t = int(time.time()) // 86400
                    tq = sum(v.get("free", 0) for v in USERS.values() if v.get("day") == t)
                    tp = sum(v.get("pts", 0) for v in USERS.values())
                    tb = sum(v.get("refs", 0) for v in USERS.values())
                    api("sendMessage", {"chat_id": c,
                        "text": f"📊 <b>Daily Stats</b>\n\n📝 Questions today: <b>{tq}</b>\n🎯 Quiz points (all): <b>{tp}</b>\n👥 Referrals (all): <b>{tb}</b>\n👤 Total users: <b>{len(USERS)}</b>",
                        "parse_mode": "HTML"})
                elif data == "adm_bc":
                    ADMIN = os.environ.get("ADMIN_ID", ADMIN_DEFAULT)
                    if uid != str(ADMIN):
                        continue
                    api("sendMessage", {"chat_id": c,
                        "text": "📢 <b>Broadcast</b>\n\nSend like this:\n<code>/broadcast Your message here</code>\n\nGoes to all users (except banned).",
                        "parse_mode": "HTML"})
                elif data == "adm_ban":
                    ADMIN = os.environ.get("ADMIN_ID", ADMIN_DEFAULT)
                    if uid != str(ADMIN):
                        continue
                    api("sendMessage", {"chat_id": c,
                        "text": "🚫 <b>Ban / Unban</b>\n\n<code>/ban USER_ID</code>\n<code>/unban USER_ID</code>\n\nGet IDs from 👥 All Users.",
                        "parse_mode": "HTML"})
                elif data == "fb_good":
                    api("answerCallbackQuery", {"callback_query_id": q["id"], "text": "Great! Keep going!"})
                elif data == "fb_bad":
                    api("answerCallbackQuery", {"callback_query_id": q["id"], "text": "Explaining easier..."})
                    p = USERS.get(uid, {})
                    lq = p.get("lastq", "")
                    if lq:
                        api("sendChatAction", {"chat_id": c, "action": "typing"})
                        a2 = ask("আরও সহজ করে, ছোট উদাহরণ দিয়ে বোঝাও: " + lq, p.get("pro", 0) > time.time(), p.get("cls", ""))
                        if a2:
                            api("sendMessage", {"chat_id": c, "text": f"💡 <b>Easier version</b> (in Bangla)\n\n{a2}", "parse_mode": "HTML"})
                elif data.startswith("getpdf_"):
                    i = int(data[7:])
                    keys = list(PDFS.keys())
                    if 0 <= i < len(keys):
                        api("sendDocument", {"chat_id": c, "document": PDFS[keys[i]]["file_id"],
                                             "caption": f"📄 {keys[i]}\n📚 PoruaBuddy Notes"})
                continue
            if "pre_checkout_query" in u:
                api("answerPreCheckoutQuery", {
                    "pre_checkout_query_id": u["pre_checkout_query"]["id"], "ok": True,
                })
                continue
            m = u.get("message", {})
            c = m.get("chat", {}).get("id")
            frm = m.get("from", {})
            uid = str(frm.get("id", ""))
            name = frm.get("first_name", "Friend")
            uname = frm.get("username", "")
            tx = m.get("text", "") or m.get("caption", "")
            if not c:
                continue
            ADMIN = os.environ.get("ADMIN_ID", ADMIN_DEFAULT)
            if "document" in m:
                if uid != str(ADMIN):
                    api("sendMessage", {"chat_id": c, "text": "⛔ Only admin can upload PDFs."})
                else:
                    d = m["document"]
                    fname = d.get("file_name", "note.pdf")
                    if not fname.lower().endswith(".pdf"):
                        api("sendMessage", {"chat_id": c, "text": "⚠️ Send only PDF files."})
                    else:
                        PDFS[fname] = {"file_id": d["file_id"], "by": name, "at": int(time.time())}
                        api("sendMessage", {"chat_id": c, "text": f"✅ PDF saved! 📄 <b>{fname}</b>\nUsers get it from 📚 Notes.", "parse_mode": "HTML"})
                continue
            if "successful_payment" in m:
                p = USERS.get(uid, {"free": 0, "day": 0, "pro": 0, "last": 0})
                p["pro"] = int(time.time()) + 30 * 86400
                USERS[uid] = p
                api("sendMessage", {
                    "chat_id": c,
                    "text": "🎉 <b>Premium ON!</b> 30 days unlimited 🚀",
                    "parse_mode": "HTML", "reply_markup": MENU_KB,
                })
                continue
            is_new = uid not in USERS
            p = USERS.get(uid, {"free": 0, "day": int(time.time()) // 86400, "pro": 0, "last": 0, "cls": "", "uname": "", "lastq": ""})
            USERS[uid] = p
            if uname:
                p["uname"] = uname
            today = int(time.time()) // 86400
            if p["day"] != today:
                p["day"] = today
                p["free"] = 0
            pro = p.get("pro", 0) > time.time()

            if p.get("banned") and not tx.startswith("/start"):
                api("sendMessage", {"chat_id": c, "text": "🚫 You are banned. Contact admin."})
                continue

            if tx.startswith("/start"):
                if is_new:
                    parts = tx.split(None, 1)
                    if len(parts) > 1 and parts[1].startswith("ref"):
                        ref = parts[1][3:].strip()
                        if ref and ref != uid and ref in USERS:
                            rp = USERS[ref]
                            rp["bonus"] = rp.get("bonus", 0) + REF_BONUS
                            rp["refs"] = rp.get("refs", 0) + 1
                            try:
                                api("sendMessage", {"chat_id": int(ref),
                                    "text": f"🎉 <b>New friend joined!</b>\n🎁 Bonus: <b>+{REF_BONUS} credits</b>\n👥 Total referrals: <b>{rp['refs']}</b>",
                                    "parse_mode": "HTML"})
                            except Exception:
                                pass
                    send_photo(c, banner(), "📚 PoruaBuddy 2.0 — Your AI Study Companion! 🚀")
                    api("sendMessage", {"chat_id": c,
                        "text": greet(name) + "\n\n🎓 <b>Which class are you in?</b> 👇 Pick once (answers come in Bangla):",
                        "parse_mode": "HTML", "reply_markup": CLASS_KB})
                else:
                    api("sendMessage", {
                        "chat_id": c,
                        "text": f"Welcome back <b>{name}</b>! 📚 You have <b>{max(20 + p.get('bonus', 0) - p['free'], 0)} credits</b> left today. Type your question 👇 (answer comes in Bangla)",
                        "parse_mode": "HTML", "reply_markup": MENU_KB,
                    })
            elif tx == "📝 Study":
                api("sendMessage", {
                    "chat_id": c,
                    "text": "📚 <b>Which subject?</b> 👇 (answers come in Bangla)",
                    "parse_mode": "HTML", "reply_markup": SUBJECT_KB,
                })
            elif tx == "⭐ Premium":
                api("sendMessage", {
                    "chat_id": c,
                    "text": "━━━━━━━━━━━━━━━\n⭐ <b>PoruaBuddy Premium</b> ⭐\n━━━━━━━━━━━━━━━\n✅ Unlimited questions ♾️\n✅ Fast answers ⚡\n✅ Matched to your class 🎓\n\n💰 Only <b>100 TK/month</b> (bKash)\n👇 Tap below to get it:",
                    "parse_mode": "HTML", "reply_markup": kb_pro(),
                })
            elif tx == "👤 Profile":
                rank = sorted(USERS.items(), key=lambda x: x[1].get("free", 0), reverse=True)
                pos = next((i + 1 for i, (k, v) in enumerate(rank) if k == uid), 1)
                allowed = 20 + p.get("bonus", 0)
                left = "Unlimited ♾️" if pro else f"{max(allowed - p['free'], 0)} credits"
                bar = "⭐" * 10 if pro else "🟩" * (min(p["free"] * 10 // allowed, 10) or 1) + "⬜" * (10 - (min(p["free"] * 10 // allowed, 10) or 1))
                api("sendMessage", {
                    "chat_id": c,
                    "text": f"━━━━━━━━━━━━━━━\n👤 <b>{name}</b> {'⭐' if pro else ''}\n🆔 @{p.get('uname', '-')}\n🏆 Rank #{pos} | 🎓 Class {p.get('cls', '?')} | 🎯 <b>{p.get('pts', 0)} pts</b>\n👥 Referrals: <b>{p.get('refs', 0)}</b>\n━━━━━━━━━━━━━━━\n{bar}\n💳 Credits used: <b>{p['free']}/{allowed}</b> | Balance: <b>{left}</b>",
                    "parse_mode": "HTML", "reply_markup": MENU_KB,
                })
            elif tx in ("❓ Help", "/help"):
                api("sendMessage", {
                    "chat_id": c,
                    "text": "━━━━━━━━━━━━━━━\n❓ <b>Help</b>\n━━━━━━━━━━━━━━━\n1️⃣ Tap 📝 <b>Study</b> to pick a subject, or just type your question\n2️⃣ Free: 1 question every 20 seconds\n3️⃣ Rate every answer with 👍/👎\n4️⃣ ⭐ Premium = unlimited + only 5 sec wait\n\n💬 <i>All answers come in Bangla.</i>",
                    "parse_mode": "HTML", "reply_markup": MENU_KB,
                })
            elif tx.startswith("/approve"):
                ADMIN = os.environ.get("ADMIN_ID", ADMIN_DEFAULT)
                if str(c) != str(ADMIN) and uid != str(ADMIN):
                    api("sendMessage", {"chat_id": c, "text": "⛔ Admin only."})
                else:
                    parts = tx.split()
                    if len(parts) < 2:
                        api("sendMessage", {"chat_id": c, "text": "Use: /approve [user_id]"})
                    else:
                        t = parts[1]
                        tp = USERS.get(t, {"free": 0, "day": 0, "pro": 0, "last": 0, "cls": "", "uname": "", "lastq": ""})
                        tp["pro"] = int(time.time()) + 30 * 86400
                        USERS[t] = tp
                        api("sendMessage", {"chat_id": c, "text": f"✅ Premium ON for {t}! 🎉"})
                        try:
                            api("sendMessage", {"chat_id": int(t), "text": "🎉 <b>Your premium is ON!</b> 30 days unlimited 🚀", "parse_mode": "HTML"})
                        except Exception:
                            pass
            elif tx.lower().startswith("trxid") or p.get("pay_step") == "await_trx":
                raw = tx.strip()
                if raw.lower().startswith("trxid"):
                    raw = raw.split(None, 1)[1].strip() if len(raw.split(None, 1)) > 1 else ""
                trx = raw
                if len(trx) < 6:
                    api("sendMessage", {"chat_id": c, "text": "⚠️ Send a valid TrxID. Example: <code>TrxID 9HXK2MABCD</code>", "parse_mode": "HTML"})
                else:
                    p["trx"] = trx
                    USERS[uid] = p
                    txt = (f"━━━━━━━━━━━━━━━\n🧾 <b>Step 3/3: Confirm</b>\n━━━━━━━━━━━━━━━\n💰 100 TK → <b>01767882562</b>\n🧾 TrxID: <code>{trx}</code>\n\nIf all correct, submit 👇")
                    kb = {"inline_keyboard": [[{"text": "✅ Submit", "callback_data": "trx_ok"}]]}
                    if p.get("pay_mid"):
                        r = api("editMessageText", {"chat_id": c, "message_id": p["pay_mid"], "text": txt, "parse_mode": "HTML", "reply_markup": kb})
                        if not r.get("ok"):
                            r = api("sendMessage", {"chat_id": c, "text": txt, "parse_mode": "HTML", "reply_markup": kb})
                            if r.get("result"):
                                p["pay_mid"] = r["result"]["message_id"]
                    else:
                        r = api("sendMessage", {"chat_id": c, "text": txt, "parse_mode": "HTML", "reply_markup": kb})
                        if r.get("result"):
                            p["pay_mid"] = r["result"]["message_id"]
            elif tx == "/admin":
                ADMIN = os.environ.get("ADMIN_ID", ADMIN_DEFAULT)
                if uid != str(ADMIN):
                    api("sendMessage", {"chat_id": c, "text": "⛔ Admin only!"})
                else:
                    total = len(USERS)
                    pros = sum(1 for v in USERS.values() if v.get("pro", 0) > time.time())
                    today_q = sum(v.get("free", 0) for v in USERS.values() if v.get("day") == int(time.time()) // 86400)
                    banned = sum(1 for v in USERS.values() if v.get("banned"))
                    api("sendMessage", {
                        "chat_id": c,
                        "text": f"━━━━━━━━━━━━━━━\n🛠 <b>Admin Panel</b>\n━━━━━━━━━━━━━━━\n👥 Users: <b>{total}</b> | 🚫 Banned: <b>{banned}</b>\n⭐ Premium: <b>{pros}</b>\n📝 Today's Qs: <b>{today_q}</b>\n\n👇 Pick an action:",
                        "parse_mode": "HTML",
                        "reply_markup": {"inline_keyboard": [
                            [{"text": "👥 All Users", "callback_data": "adm_users"},
                             {"text": "📊 Daily Stats", "callback_data": "adm_stats"}],
                            [{"text": "📢 Broadcast", "callback_data": "adm_bc"},
                             {"text": "🚫 Ban/Unban", "callback_data": "adm_ban"}],
                        ]},
                    })
            elif tx.startswith("/broadcast "):
                ADMIN = os.environ.get("ADMIN_ID", ADMIN_DEFAULT)
                if uid != str(ADMIN):
                    api("sendMessage", {"chat_id": c, "text": "⛔ Admin only!"})
                else:
                    msg = tx[len("/broadcast "):].strip()
                    ok, fail = 0, 0
                    api("sendMessage", {"chat_id": c, "text": f"📢 Sending to {len(USERS)} users..."})
                    for u, v in list(USERS.items()):
                        if v.get("banned"):
                            continue
                        try:
                            r = api("sendMessage", {"chat_id": int(u), "text": f"📢 <b>Announcement</b>\n\n{msg}", "parse_mode": "HTML"})
                            ok += 1 if r.get("ok") else 0
                            fail += 0 if r.get("ok") else 1
                        except Exception:
                            fail += 1
                        time.sleep(0.05)
                    api("sendMessage", {"chat_id": c, "text": f"✅ Done! Sent: {ok}, Failed: {fail}"})
            elif tx.startswith("/ban "):
                ADMIN = os.environ.get("ADMIN_ID", ADMIN_DEFAULT)
                if uid != str(ADMIN):
                    api("sendMessage", {"chat_id": c, "text": "⛔ Admin only!"})
                else:
                    t = tx.split()[1]
                    if t in USERS:
                        USERS[t]["banned"] = True
                        api("sendMessage", {"chat_id": c, "text": f"🚫 {t} banned!"})
                    else:
                        api("sendMessage", {"chat_id": c, "text": "User not found."})
            elif tx.startswith("/unban "):
                ADMIN = os.environ.get("ADMIN_ID", ADMIN_DEFAULT)
                if uid != str(ADMIN):
                    api("sendMessage", {"chat_id": c, "text": "⛔ Admin only!"})
                else:
                    t = tx.split()[1]
                    if t in USERS:
                        USERS[t]["banned"] = False
                        api("sendMessage", {"chat_id": c, "text": f"✅ {t} unbanned!"})
                    else:
                        api("sendMessage", {"chat_id": c, "text": "User not found."})
            elif tx == "🎯 Quiz":
                qs = random.sample(range(len(QUIZ)), min(5, len(QUIZ)))
                p["qsession"] = {"qs": qs, "pos": 0, "score": 0}
                USERS[uid] = p
                qz = QUIZ[qs[0] % len(QUIZ)]
                kb = {"inline_keyboard": [[{"text": o, "callback_data": f"quiz_{qs[0]}_{i}"}] for i, o in enumerate(qz["o"])]}
                api("sendMessage", {"chat_id": c,
                    "text": f"🎯 <b>Quiz Round — 5 Questions!</b>\n🏅 Your points: <b>{p.get('pts', 0)}</b> | +10 per correct\n\n━━━━━━━━━━━━━━━\n❓ <b>Q1/5:</b> {qz['q']}\n👇 Tap the answer:",
                    "parse_mode": "HTML", "reply_markup": kb})
            elif tx == "📚 Notes":
                if not PDFS:
                    api("sendMessage", {"chat_id": c, "text": "📚 <b>Notes & Suggestions</b>\n\nNo notes yet. Coming soon! 📝", "parse_mode": "HTML", "reply_markup": MENU_KB})
                else:
                    kb = {"inline_keyboard": [[{"text": f"📄 {k}", "callback_data": f"getpdf_{i}"}]] for i, k in enumerate(list(PDFS.keys())[:20])}
                    api("sendMessage", {"chat_id": c, "text": "📚 <b>Notes & Suggestions</b>\n👇 Tap to download:", "parse_mode": "HTML", "reply_markup": kb})
            elif tx == "👥 Invite Friends":
                refs = p.get("refs", 0)
                bonus = p.get("bonus", 0)
                api("sendMessage", {
                    "chat_id": c,
                    "text": f"━━━━━━━━━━━━━━━\n👥 <b>Invite Friends, Earn Credits!</b>\n━━━━━━━━━━━━━━━\n🔗 Your link:\n<code>https://t.me/PoruaBuddyBot?start=ref{uid}</code>\n\n🎁 <b>+{REF_BONUS} credits</b> per friend (1 credit = 1 question)\n👥 Your referrals: <b>{refs}</b> | Credits earned: <b>{bonus}</b>\n\n📤 Share it in your class group!",
                    "parse_mode": "HTML", "reply_markup": MENU_KB,
                })
            elif not pro and p["free"] >= 20 + p.get("bonus", 0):
                api("sendMessage", {
                    "chat_id": c,
                    "text": "💳 Out of credits!\n👥 Invite friends for +5 credits each, or take ⭐ Premium (unlimited) 👇",
                    "parse_mode": "HTML", "reply_markup": MENU_KB,
                })
            else:
                cd = COOLDOWN_PRO if pro else COOLDOWN_FREE
                wait = int(cd - (time.time() - p.get("last", 0)))
                if wait > 0:
                    api("sendMessage", {"chat_id": c, "text": f"⏳ Wait <b>{wait} seconds</b>, then ask again.", "parse_mode": "HTML"})
                    continue
                p["free"] += 1
                p["last"] = time.time()
                p["lastq"] = tx
                allowed = 20 + p.get("bonus", 0)
                tag = "⭐ Premium" if pro else f"💳 {max(allowed - p['free'], 0)} credits left"
                api("sendChatAction", {"chat_id": c, "action": "typing"})
                w = api("sendMessage", {
                    "chat_id": c,
                    "text": "⏳ <b>Making your answer...</b> ✍️\n<i>May take up to 30 seconds</i>",
                    "parse_mode": "HTML",
                })
                api("sendChatAction", {"chat_id": c, "action": "typing"})
                a = ask(tx, pro, p.get("cls", ""))
                mid = w.get("result", {}).get("message_id")
                if mid:
                    api("deleteMessage", {"chat_id": c, "message_id": mid})
                if not a:
                    api("sendMessage", {
                        "chat_id": c,
                        "text": "⚠️ Server is busy, try again in 1 minute. 🙏",
                        "reply_markup": MENU_KB,
                    })
                else:
                    fb = {"inline_keyboard": [[{"text": "👍 Got it", "callback_data": "fb_good"}, {"text": "👎 Explain easier", "callback_data": "fb_bad"}]]}
                    api("sendMessage", {"chat_id": c, "text": f"━━━━━━━━━━━━━━━\n📖 <b>Answer</b> 🎓 {p.get('cls', '')}\n━━━━━━━━━━━━━━━\n\n{a}\n\n━━━━━━━━━━━━━━━\n<i>{tag} | Understood?</i> 👇", "parse_mode": "HTML", "reply_markup": fb})
    except Exception as e:
        print("ERR", e, flush=True)
        time.sleep(3)
