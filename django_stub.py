"""
Basic Django-style backend stub for Lucy Gaming Center.
This file is a high-level example of how a Django app could model users, wallet activities, and game play.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List

@dataclass
class Transaction:
    type: str
    title: str
    details: str
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())

@dataclass
class Player:
    name: str
    email: str
    balance: float = 0.0
    history: List[Transaction] = field(default_factory=list)
    last_bonus_date: str = ''

    def deposit(self, amount: float):
        self.balance += amount
        self.history.insert(0, Transaction('deposit', 'Deposit successful', f'Added ${amount:.2f} to wallet.'))

    def withdraw(self, amount: float):
        if amount > self.balance:
            raise ValueError('Insufficient balance')
        self.balance -= amount
        self.history.insert(0, Transaction('withdraw', 'Withdrawal completed', f'Removed ${amount:.2f} from wallet.'))

    def record_game(self, win: bool, amount: float, game_name: str):
        label = 'Game win' if win else 'Game loss'
        details = f"{'Won' if win else 'Lost'} ${amount:.2f} in {game_name}."
        self.history.insert(0, Transaction('win' if win else 'loss', label, details))

# In a real Django project, models.Model would replace dataclass and views would use Django REST Framework.

if __name__ == '__main__':
    player = Player(name='Demo', email='demo@example.com')
    player.deposit(100)
    player.record_game(True, 45.0, 'Crypto Clash')
    print(player)
