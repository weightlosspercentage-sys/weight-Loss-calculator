import csv
import io
import os
import json
from collections import defaultdict

# Both CSV data blocks from prompt
# CSV 1 (Weight loss percentage keywords)
# CSV 2 (Calorie calculator keywords)

def main():
    # We will load the keywords directly from the prompt text
    # and map them against existing routes in the project.
    
    # Existing routes in project:
    existing_calculators = [
        'calculators/weight-loss',
        'calculators/baby-weight-loss',
        'calculators/bariatric-surgery-weight-loss',
        'calculators/biggest-loser',
        'calculators/bmi',
        'calculators/bmr',
        'calculators/body-fat',
        'calculators/calorie-deficit',
        'calculators/calorie',
        'calculators/dog-weight-loss',
        'calculators/fat-loss',
        'calculators/fitness',
        'calculators/glp1-weight-loss',
        'calculators/infant-weight-loss',
        'calculators/keto',
        'calculators/macro',
        'calculators/newborn-weight-loss',
        'calculators/nutrition',
        'calculators/peptide-dosage',
        'calculators/postpartum-weight-loss',
        'calculators/pregnancy',
        'calculators/protein',
        'calculators/specialized',
        'calculators/tdee',
        'calculators/walking',
        'calculators/water-intake',
        'restaurants/mcdonalds',
        'restaurants/starbucks',
        'restaurants/subway',
        'compare/body-fat-vs-bmi',
        'compare/weight-loss-vs-fat-loss',
    ]

    print("Existing calculator/restaurant pages:", len(existing_calculators))

if __name__ == '__main__':
    main()
