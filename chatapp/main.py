from flask import Flask, request, jsonify, send_from_directory
import os
from google.cloud import aiplatform
import vertexai
from vertexai.preview.generative_models import GenerativeModel
import logging

app = Flask(__name__, static_url_path='/static', static_folder='static')

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PROJECT_ID = "aitx-hack24aus-621"
LOCATION = "us-central1"

vertexai.init(project=PROJECT_ID, location=LOCATION)
model = GenerativeModel("gemini-1.5-flash-001")

#GREAT practice to commit api keys to git ¯\_(ツ)_/¯
API_KEY = 'AIzaSyBGaL1HiIpz2oCbDqA0P2yOOV2XXLzZhbQ'

@app.route('/')
def home():
    return app.send_static_file('index.html')


#######VISION########################

def ul_vid(path):

    logger.info('configuring client')
    key = userdata.get('gemini-api-key')
    genai.configure(api_key=API_KEY)
    logger.info('client configured')

    logger.info('uploading file')
    vid = genai.upload_file(path=path)
    logger.info(f'upload complete with file at {vid.uri}')

    logger.info('upload processing')
    while vid.state.name == "PROCESSING":
        time.sleep(0.25)
        vid = genai.get_file(vid.name)
    
    if vid.state.name == "FAILED":
        logger.error('file processing failed! file cannot be used for inference')
        raise ValueError(video_file.state.name)

    logger.info('upload ready for inference')
    return vid


def scan(vid):
    model = genai.GenerativeModel(model_name="gemini-1.5-pro-latest")
    system = """You are assisting a personal chef.
You will be given a video containing the contents of someone's kitchen.
You may see a pantry or a fridge/freezer.
Carefully scan through the footage and identify all of the ingredients you see.
Your output should ONLY be a list of all of the ingredients."""

    logger.info('scanning upload')
    try:
        response = model.generate_content([system, vid],request_options={"timeout": 600})
    except:
        logger.error(f"An error occurred while analyzing file: {response}")
        raise Exception('ingredient scan failed')

    logger.info('scanning completed successfully')
    return response.text

def generate_ingredient_list(video_path):
    uploaded_vid = ul_vid(video_path)
    ingredients = scan(uploaded_vid)
    logger.info(f"ingredients detected by Gemini: {ingredients}")
    return ingredients


@app.route('/api/analyze_kitchen', methods=['POST'])
def analyze_kitchen():
    if 'video' not in request.files:
        return jsonify({"error": "No video file provided"}), 400
    
    video = request.files['video']
    if video.filename == '':
        return jsonify({"error": "No selected video file"}), 400
    
    if video:
        video_path = os.path.join('temp', video.filename)
        video.save(video_path)
        
        try:
            ingredients = generate_ingredient_list(video_path)

            return jsonify({"ingredients": ingredients})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            # Clean up the temporary file
            os.remove(video_path)
    
    return jsonify({"error": "Failed to process video"}), 500

#####################################

def generate_ai_response(prompt):
    try:
        response = model.generate_content(
            prompt,
            generation_config={
                "max_output_tokens": 1024,
                "temperature": 0.7,
                "top_p": 1.0,
                "top_k": 40
            }
        )
        logger.info(f"AI Response: {response.text}")
        logger.info(f"AI Response Length: {len(response.text)}")
        return response.text
    except Exception as e:
        logger.error(f"Error generating AI response: {str(e)}")
        return None

@app.route('/api/generate_recipe', methods=['POST'])
def generate_recipe():
    data = request.json
    prompt = data['prompt']
    logger.info(f"Generating recipe for prompt: {prompt}")
    
    recipe = generate_ai_response(
        f"Generate a recipe based on the following prompt: {prompt}. "
        "Include ingredients, instructions, and cooking time."
    )
    
    if recipe:
        return jsonify({"recipe": recipe})
    else:
        return jsonify({"error": "Failed to generate recipe"}), 500

@app.route('/api/spice_recipe', methods=['POST'])
def spice_recipe():
    data = request.json
    original_recipe = data['recipe']
    logger.info("Spicing up recipe")
    
    spicy_recipe = generate_ai_response(
        f"Here's a recipe: {original_recipe}\n\n"
        "Please modify this recipe to make it spicier. Add or increase spicy ingredients, "
        "and adjust the instructions accordingly. Maintain the overall structure and cooking time."
    )
    
    if spicy_recipe:
        return jsonify({"spicey_recipe": spicy_recipe})
    else:
        return jsonify({"error": "Failed to spice up recipe"}), 500

@app.route('/api/simplify_recipe', methods=['POST'])
def simplify_recipe():
    data = request.json
    original_recipe = data['recipe']
    logger.info("Simplifying recipe")
    
    simplified_recipe = generate_ai_response(
        f"Here's a recipe: {original_recipe}\n\n"
        "Please simplify this recipe by reducing the number of ingredients and simplifying the instructions. "
        "Maintain the essence of the dish but make it easier to prepare with fewer ingredients."
    )
    
    if simplified_recipe:
        return jsonify({"simplified_recipe": simplified_recipe})
    else:
        return jsonify({"error": "Failed to simplify recipe"}), 500

@app.route('/api/fancy_recipe', methods=['POST'])
def fancy_recipe():
    data = request.json
    original_recipe = data['recipe']
    logger.info("Making recipe fancy")
    
    fancy_recipe = generate_ai_response(
        f"Here's a recipe: {original_recipe}\n\n"
        "Please transform this recipe into a super fancy, gourmet version. Use high-end ingredients, "
        "sophisticated cooking techniques, and elegant plating suggestions. Elevate the dish to fine-dining status."
    )
    
    if fancy_recipe:
        return jsonify({"fancy_recipe": fancy_recipe})
    else:
        return jsonify({"error": "Failed to make recipe fancy"}), 500

@app.route('/api/vegan_recipe', methods=['POST'])
def vegan_recipe():
    data = request.json
    original_recipe = data['recipe']
    logger.info("Converting recipe to vegan")
    
    vegan_recipe = generate_ai_response(
        f"Here's a recipe: {original_recipe}\n\n"
        "Please convert this recipe into a vegan version. Replace all animal products with plant-based alternatives. "
        "Ensure the recipe remains delicious and nutritionally balanced while being completely vegan."
    )
    
    if vegan_recipe:
        return jsonify({"vegan_recipe": vegan_recipe})
    else:
        return jsonify({"error": "Failed to convert recipe to vegan"}), 500

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
