from transformers import GPT2LMHeadModel, GPT2Tokenizer
import torch, random

model_test = GPT2LMHeadModel.from_pretrained("gpt2-finetuned-final")
tokenizer_test = GPT2Tokenizer.from_pretrained("gpt2-finetuned-final")
tokenizer_test.pad_token = tokenizer_test.eos_token

riddle_pool = []

def generate_riddle():
    prompt = f"Generate Question and Answer based on this Category: Capitals"
    input_ids = tokenizer_test.encode(prompt, return_tensors="pt").to(model_test.device)
    attention_mask = torch.ones_like(input_ids)
    
    output = model_test.generate(
        input_ids=input_ids,
        attention_mask=attention_mask,
        max_length=200,
        temperature=0.7,
        top_p=0.9,
        do_sample=True,
        pad_token_id=tokenizer_test.eos_token_id
    )
    
    generated_text = tokenizer_test.decode(output[0], skip_special_tokens=True)
    
    try:
        parts = generated_text.split("|")
        question_part = next(part for part in parts if "Question:" in part).strip()
        answer_part = next(part for part in parts if "Answer:" in part).strip()

        question = question_part.replace("Question:", "").strip()
        answer = answer_part.replace("Answer:", "").strip()
    except (ValueError, StopIteration):
        question = "Invalid format: Unable to parse question"
        answer = "Unknown"
    
    return {"question": question, "answer": answer}


def populate_riddle_pool(count=1, category="Capitals"):
    global riddle_pool
    riddle_pool = [generate_riddle() for _ in range(count)]
    print(f"Generated {len(riddle_pool)} riddles for category '{category}'")
    print(riddle_pool)

populate_riddle_pool()