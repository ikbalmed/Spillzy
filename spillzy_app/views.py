from google import genai
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))

@csrf_exempt
def chat(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            user_prompt = data.get('user_prompt')
            if not user_prompt:
                return JsonResponse({'error': 'Please enter some text.'}, status=200)
            if len(user_prompt) > 1000:
                return JsonResponse({
                    'error': 'Your message is too long. Maximum allowed is 1000 characters.'
                }, status=200)
            
            user_key = data.get('user_key')
            if not user_key:
                import uuid
                user_key = str(uuid.uuid4())
            
            user_info = {
                'name': data.get('user_name', 'unknown'),
                'age': data.get('user_age', 'unknown'),
                'gender': data.get('user_gender', 'unknown')
            }
            
            chat_history_str = data.get('chat_history', '')
            try:
                if chat_history_str:
                    chat_history = json.loads(chat_history_str)
                else:
                    chat_history = []
            except (json.JSONDecodeError, TypeError):
                chat_history = []
            
            conversation = ""
            if chat_history:
                conversation = "Previous conversation:\n"
                for msg in chat_history[-69:]:
                    if msg.get('is_user'):
                        conversation += f"User said: {msg.get('content', '')}\n"
                        conversation += f"User unique key: {msg.get('unique_key', '')}\n"
                    else:
                        conversation += f"You responded: {msg.get('content', '')}\n"
            
            user_context = f"Speaking with {user_info['name']} (Age: {user_info['age']}, Gender: {user_info['gender']})\n" if user_info['name'] != 'unknown' else ""
            print(conversation)
            prompt = f"""
                You are a Gen Z-style gossip-loving AI bestie. You live for drama, rumors, secrets, and spicy updates. You respond like you're on FaceTime with your best friend. Be playful, funny, and over-the-top — but always respectful and supportive.

                User Info:
                - Unique Key: {user_key}
                - Age: {user_info['age']}
                - Gender: {user_info['gender']}

                {user_context}
                {conversation}

                Now your bestie (aka the user) just said:
                "{user_prompt}"

                Instructions:
                1. React like a chill, gossipy friend. Use Gen Z slang, casual energy, and give off "omg tell me everything" vibes.
                2. Be welcoming and nonjudgmental — whether the user drops drama, shares a rumor, asks a question, or vents something juicy.
                3. IMPORTANT: Before asking a user with unknown name for their name, check if they mentioned it in previous conversations first.
                4. Adapt your style based on gender:
                - Male → talk like a drama-loving bro ("no way dude 😭", "bro this is WILD fr").
                - Female → Gen Z girl bestie energy ("girl, STOP 😭", "not you dropping this tea like it's nothing 💅").
                - Unknown → use a friendly and inclusive gossip tone. Not girly nor manly.
                5. Adjust for age:
                - Under 25 → full TikTok/Gen Z chaos (slang, energy, short lines).
                - 25+ → still fun, but a little clearer and more relaxed (less slang overload).
                6. If the user **asks a serious question** or says **"be serious"**, switch to a more honest, calm tone — but still sound like a real friend who cares.
                7. If the message connects to past convo gossip AND the user key matches, bring it up — but only if it adds to the vibe. Don't repeat stuff for no reason.
                8. Don't fact-check or analyze. Just react, vibe, and keep the convo flowing.
                9. Do not lie, if the user is asking something serious and lying wouldnt be funny, just say the truth, for example if a user says "do you remember me" and you do not recall the user, just deny.
                10. Use emojis *lightly* (1–2 max) only if they boost the drama or punchline.
                Also remember, if the username is unknown, try to be friendly and get their name, and talk in a neutral tone, not girly nor manly, figure out the gender according to their name and respond with their gender tone, but don't insist on the name if they did not answer the first time, instead say something like "since you are not telling me your name, i am calling you (Make up some name for them) till you tell me your name".
                The user can tell you their name in chat, Check your previous conversations maybe they mentioned their name.
                Goal: Make the user feel like they're talking to their fave gossip buddy — someone who hypes them up, spills tea with them, and can keep it real when needed.
                """
            
            response = client.models.generate_content(
                model="models/gemini-2.5-flash-preview-05-20",
                contents=prompt,
            )
            
            if not response or not hasattr(response, 'text'):
                return JsonResponse({
                    'result': "Sorry, I might be unable to talk to you rn because of an internal error (or just say I'm not in the mood) but come try again later!",
                })
                
            result = response.text
            
            chat_history.append({
                'is_user': True,
                'content': user_prompt,
                'unique_key': user_key
            })
            chat_history.append({
                'is_user': False,
                'content': result
            })
            
            if len(chat_history) > 69:
                chat_history = chat_history[-69:]
            
            updated_chat_history = json.dumps(chat_history)
            
            return JsonResponse({
                'result': result,
                'chat_history': updated_chat_history,
            })
            
        except Exception as e:
            print(f"Error in chat view: {str(e)}")
            return JsonResponse({
                'result': "Sorry, I might be unable to talk to you rn because of an internal error (or just say I'm not in the mood) but come try again later!",
            }, status=200)
    
    return JsonResponse({'error': 'Invalid request method'}, status=405)