from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import pickle
import json
import pathlib
import pandas as pd

DIR = pathlib.Path(__file__).parent.resolve()

WEIGHTS_PATH = 'assets/best-weights-RP3beta.uu'

with open(WEIGHTS_PATH, 'rb') as ifp:
    factors = pickle.load(ifp)['W']

with open('assets/item2idbaselines.json','r') as f:
    models = {y: x for x, y in json.load(f).items()}

id2item = models
item2idx = {y: x for x, y in models.items()}


def get_recommendations(baselines: list[str], item2idx: dict, idx2item: dict, factors: np.ndarray):
    
    vector = np.zeros(len(models))
    for baseline in baselines:
        if baseline in item2idx:
            vector[item2idx[baseline]] = 1
            
    predictions = vector.dot(factors)
    predictions[vector==1] = -np.inf
    recs = np.argsort(-predictions)
    decoded = [idx2item[x] for x in recs]

    return decoded, -np.sort(-predictions)



app = FastAPI()

origins = [
    "http://recbaselines2023.site",
    "recbaselines2023.siterecbaselines2023.site",
    "http://194.58.103.30",
    "194.58.103.30",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/", tags=["ping"])
async def ping() -> dict:
    return {"message": "ok"}


models_info = pd.read_csv('assets/models_info.csv')
models_info_cleaned = models_info.dropna().reset_index().set_index('Creation')


@app.get("/get_models", tags=["models"])
async def get_models() -> dict:
    return {
        "data": list(map(lambda x: {'value': x[0], 'value': x[1]}, models.items()))
    }

def get_paper_descriptions(model_names: list[str]):
    recs, scores = get_recommendations(model_names, item2idx, id2item, factors)
    papers = []
    for i, rec in enumerate(recs):
        if rec in models_info_cleaned.index:
            m = models_info_cleaned[models_info_cleaned.index == rec].iloc[0]
            if m.name in model_names:
                continue

            papers.append({
                'label': m.name,
                'year': int(m['Year']),
                'url': m['link'],
                'paper': m['Title'],
                'value': m.name,
                'abstract': m['Abstract'],
                'score': scores[i]
            })
    
    return papers


@app.post("/get_descriptions")
async def get_description(model_names: list[str]):
    return {
        "data": get_paper_descriptions(model_names)
    }
