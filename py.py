import requests


res = requests.post(" https://next.zarinpal.com/api/oauth/register", headers={"Content-Type": "application/json"},json={
    "first_name": "امیر",
    "last_name": "فتاحی",
    "cell_number": "09038205837"
})




print(res.status_code)
print(res.headers)
print(res.text)






