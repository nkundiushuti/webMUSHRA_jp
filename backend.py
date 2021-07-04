from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tinydb import TinyDB, Query
from pathlib import Path
from typing import List, Optional


class WebMushraSession(BaseModel):
    testId: str
    participant: dict
    trials: list
    config: Path


class PageConfig(BaseModel):
    type: str
    id: str
    name: str
    content: Optional[str] = None


class WebMushraResponse(BaseModel):
    pages: Optional[List[PageConfig]] = None
    pagesIndex: Optional[int] = None
    error: Optional[str] = None
    

app = FastAPI()
origins = [
    "http://127.0.0.1:8080",
    "http://localhost",
    "https://jpauwels.github.io",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


db = TinyDB('db.json')


@app.post("/resume-session", response_model=WebMushraResponse, response_model_exclude_unset=True)
def resume_session(session: WebMushraSession):
    print(session)
    email = session.participant['email']
    User = Query()
 
    profile = db.search(User.email == email)
    # When new responses are sent, store them in the database and update progress index
    if session.trials:
        db.update({'trials': profile[0]['trials'] + session.trials, 'index': profile[0]['index']+1}, User.email == email)
    # Otherwise a password is sent for authentication
    else:
        password = session.participant['password']
        # If the password is incorrect, return an error
        if not profile or profile[0]['password'] != password:
            return {'error': 'Incorrect email/password combination. Refresh page to try again.'}# HTML error code
        # Otherwise return the progress index such that a session can be resumed
        else:
            return {'pagesIndex': profile[0]['index']}



@app.post("/create-user", response_model=WebMushraResponse, response_model_exclude_unset=True)
def create_user(session: WebMushraSession):
    print(session)
    email = session.participant['email']
    password = session.participant['password']
    User = Query()

    if db.search(User.email == email):
        return {'error': 'User already exists'} # HTML error code
    elif password != session.participant['password-repeated']:
        # Send error message
        return {'error': "Passwords don't match"} # HTML error code
    else:
        # Store user data
        db.insert({'email': email, 'password': password, 'index': 0, 'trials': []})
        return


@app.post("/create-user-generate-page", response_model=WebMushraResponse, response_model_exclude_unset=True)
def create_user_generate_page(session: WebMushraSession):
    ret = create_user(session)
    if ret:
        return ret
    else:
        return {'pages': [{
            'type': 'generic',
            'id': 'user-created',
            'name': 'User created',
            'content': f'<p>Hi {session.participant["email"]}! Your account has been created successfully.</p><p>Go back <a href="?config=session-restore.yaml" target="_self">to the login form</a></p>',
        }]}


@app.post("/adaptive-navigation", response_model=WebMushraResponse, response_model_exclude_unset=True)
def adaptive_navigation(session: WebMushraSession):
    db.insert(session.trials[0]['responses'][0])
    return {'pagesIndex': int(session.trials[0]['responses'][0]['stimulusRating']['go'])-1} # subtract 1 to compensate for the 1 that gets added when moving to the next page
