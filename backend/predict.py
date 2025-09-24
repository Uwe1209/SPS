import sys
import json
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision.models import mobilenet_v2
from torchvision import transforms
from PIL import Image

# === Setup ===
num_classes = 12
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load model
model = mobilenet_v2(pretrained=False)
model.classifier[1] = nn.Linear(model.last_channel, num_classes)

checkpoint = torch.load("plant_experiment_full_test_weights_best_acc.tar", map_location=device)
model.load_state_dict(checkpoint['model'])

model = model.to(device)
model.eval()

# Preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# Class names
class_names = [
    "Burmannia_disticha",
    "Burmannia_Longifolia",
    "Calophyllum_soulattri",
    "Coelogyne_Hirtella",
    "Impatiens_walleriana",
    "Nepenthes_mollis",
    "Nepenthes_tentaculata",
    "nerium_oleander",
    "Oleandra_neriiformis",
    "Palhinhaea_cernua",
    "Phyllocladus_hypophyllus",
    "Sphagnum_Cuspidatulum"
]

def predict(image_path):
    img = Image.open(image_path).convert('RGB')
    img_tensor = transform(img).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(img_tensor)
        probs = F.softmax(output, dim=1)
        pred_class_idx = probs.argmax(dim=1).item()
        confidence = probs[0, pred_class_idx].item()

    return {
        "class": class_names[pred_class_idx],
        "confidence": round(confidence, 4)
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)

    image_path = sys.argv[1]
    result = predict(image_path)
    print(json.dumps(result))
    sys.exit(0)
