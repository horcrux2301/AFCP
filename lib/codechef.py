import pyautogui
import urllib.request
from bs4 import BeautifulSoup
import time
import os
import sys

base_dir = '/Users/harshkhajuria/Desktop'
contest = sys.argv[1]
url = 'https://www.codechef.com/' + sys.argv[1]

print(sys.argv[0])
print(sys.argv)
page = urllib.request.urlopen(url)
soup = BeautifulSoup(page, 'html.parser')
problems = (soup.find_all("div", class_="problemname"))
list1 = []
for problem in problems :
	list1.append(problem.find('b').string)
for problem in list1 :
	index = list1.index(problem)
	problem = problem.replace("(", "")
	problem = problem.replace(")", "")
	list1[index] = problem.replace(" ", "\\ ")
os.chdir(base_dir)
os.system('mkdir ' + contest)
os.chdir(os.getcwd()+'/' + contest)
print(os.getcwd()+'/' + contest)
for problem in list1:
	os.system('touch ' + problem + '.cpp')
os.system('echo done')
