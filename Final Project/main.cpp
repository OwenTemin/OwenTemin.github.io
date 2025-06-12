#include <iostream>

using namespace std;

int addition(){
    int add;
    int amount;
    int ans = 0;
    cout << "How many numbers do you want to add? ";
    cin >> amount;
    for (int i = 0; i < amount; i++) {
        cout << "What number do you want to add? ";
        cin >> add;
        ans += add;
    }
    return ans;
}

int multiplication(){
    int num1;
    int num2;
    cout << "What is the first number? ";
    cin >> num1;
    cout << "What is the second number? ";
    cin >> num2;
    int ans = num1 * num2;
    return ans;


}

int division(){
    int div;
    int num;
    double quotient;
    int remainder;
    cout << "What is the divedend? ";
    cin >> div;
    cout << "What is the numerater? ";
    cin >> num;
    quotient = div / num;
    remainder = div % num;
    cout << "The remainder is - " << remainder << "\n";
    return quotient;

}

int subtraction(){
    int sub;
    int amount;
    int ans = 0;
    cout << "What number do you want to subtract from? ";
    cin >> ans;
    cout << "How many numbers do you want to subtract? ";
    cin >> amount;
    for (int i = 0; i < amount; i++) {
        cout << "What number do you want to subtract? ";
        cin >> sub;
        ans -= sub;
    }
    return ans;
}

int main() {
    int choice;
    int answer = 0;
    cout << "This is a calculator. You can " << "\n";
    cout << "1) Addition" << "\n";
    cout << "2) Subtraction" << "\n";
    cout << "3) Multiplication" << "\n";
    cout << "4) Division" << "\n";
    cout << "Please enter the number of your choice: ";
    cin >> choice;
    switch (choice){
        case 1:
            answer = addition();
            cout << "The answer is: " << answer << endl;
            break;
        case 2:
            answer = subtraction();
            cout << "The answer is: " << answer << endl;
            break;
        case 3:
            answer = multiplication();
            cout << "The answer is: " << answer << endl;
            break;
        case 4:
            answer = division();
            cout << "The answer is: " << answer << endl;
            break;
        default:
            cout << "Please enter a valid answer" << "\n";
    }
};